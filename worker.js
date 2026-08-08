/* ============================================================
   SUTHERLIN SIPS — Cloudflare Worker
   Serves the static site, and proxies the admin CMS's GitHub
   API calls (/api/v3/* REST, /api/graphql) to api.github.com
   using a server-side token — so site owners never handle a
   GitHub token themselves.

   Security: proxy routes require a valid Cloudflare Access JWT
   (the email-code login). Requests without one are rejected, so
   the proxy is useless to anyone who can't pass the email gate.

   Required Worker settings (Settings → Variables and Secrets):
   - GITHUB_TOKEN        (secret)  classic PAT with `repo` scope
   - ACCESS_TEAM_DOMAIN  (var)     e.g. myteam.cloudflareaccess.com
   - ACCESS_AUD          (var)     the Access application's AUD tag
   ============================================================ */

const GITHUB_API = "https://api.github.com";

let certsCache = { keys: null, fetched: 0 };

function b64uToBytes(s) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

function decodeJwtPart(s) {
  return JSON.parse(new TextDecoder().decode(b64uToBytes(s)));
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ message: message }), {
    status: status,
    headers: { "content-type": "application/json" },
  });
}

async function verifyAccessJwt(request, env) {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    return false; // fail closed until Access details are configured
  }
  // tolerate a team domain pasted with a protocol or trailing slash
  const teamDomain = env.ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) {
    return false;
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }
  let header;
  let payload;
  try {
    header = decodeJwtPart(parts[0]);
    payload = decodeJwtPart(parts[1]);
  } catch (e) {
    return false;
  }
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(env.ACCESS_AUD)) {
    return false;
  }
  if (!payload.exp || payload.exp * 1000 < Date.now()) {
    return false;
  }
  if (!certsCache.keys || Date.now() - certsCache.fetched > 3600 * 1000) {
    const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
    if (!res.ok) {
      return false;
    }
    certsCache = { keys: (await res.json()).keys || [], fetched: Date.now() };
  }
  const jwk = certsCache.keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    return false;
  }
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64uToBytes(parts[2]),
    new TextEncoder().encode(parts[0] + "." + parts[1])
  );
}

async function proxyGithub(request, env, url) {
  if (!env.GITHUB_TOKEN) {
    return jsonError("GitHub proxy is not configured: the GITHUB_TOKEN secret is missing on the Worker.", 503);
  }
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    return jsonError("GitHub proxy is not configured: ACCESS_TEAM_DOMAIN / ACCESS_AUD variables are missing on the Worker.", 503);
  }
  if (!(await verifyAccessJwt(request, env))) {
    return jsonError("Unauthorized: request did not carry a valid Cloudflare Access login.", 401);
  }
  const target =
    url.pathname === "/api/graphql"
      ? `${GITHUB_API}/graphql`
      : `${GITHUB_API}/${url.pathname.slice("/api/v3/".length)}${url.search}`;
  const headers = new Headers();
  for (const name of ["accept", "content-type", "if-none-match"]) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }
  headers.set("authorization", `Bearer ${env.GITHUB_TOKEN}`);
  headers.set("user-agent", "sips-admin-proxy");
  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  const upstream = await fetch(target, { method: request.method, headers, body });
  /* Rebuild the response from a buffered body with fresh headers. Copying
     upstream headers wholesale can leak a stale content-encoding /
     content-length pair (the runtime decompresses bodies transparently),
     which truncates large JSON responses in the browser. */
  const respHeaders = new Headers();
  for (const name of ["content-type", "etag", "link"]) {
    const value = upstream.headers.get(name);
    if (value) {
      respHeaders.set(name, value);
    }
  }
  if (upstream.status === 204 || upstream.status === 304) {
    return new Response(null, { status: upstream.status, headers: respHeaders });
  }
  const payload = await upstream.arrayBuffer();
  return new Response(payload, { status: upstream.status, headers: respHeaders });
}

/* ---------- Secret Sips Catch — shared scoreboard (Cloudflare KV) ---------- */

const SCORE_KEY = "leaderboard";
const MAX_TOP = 10;
const MAX_SCORE = 100000;

function scoreJson(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

async function readBoard(env) {
  if (!env.SCORES) {
    return { top: [], updated: null };
  }
  var raw = await env.SCORES.get(SCORE_KEY);
  if (!raw) {
    return { top: [], updated: null };
  }
  try {
    var parsed = JSON.parse(raw);
    return { top: Array.isArray(parsed.top) ? parsed.top : [], updated: parsed.updated || null };
  } catch (e) {
    return { top: [], updated: null };
  }
}

function boardView(board) {
  return { top: board.top || [], high: (board.top && board.top[0]) || null, updated: board.updated || null };
}

async function handleGetScores(env) {
  return scoreJson(boardView(await readBoard(env)), 200);
}

async function handlePostScore(request, env) {
  if (!env.SCORES) {
    return scoreJson({ message: "Scoreboard is not configured." }, 503);
  }
  var body;
  try {
    body = await request.json();
  } catch (e) {
    return scoreJson({ message: "Invalid request body." }, 400);
  }
  var name = String((body && body.name) || "").replace(/[<>]/g, "").trim().slice(0, 16);
  if (!name) {
    name = "Anonymous";
  }
  var score = Math.floor(Number(body && body.score));
  if (!Number.isFinite(score) || score < 0 || score > MAX_SCORE) {
    return scoreJson({ message: "Invalid score." }, 400);
  }
  var board = await readBoard(env);
  var prevHigh = (board.top[0] && board.top[0].score) || 0;
  var entry = { name: name, score: score, ts: new Date().toISOString() };
  var top = board.top
    .concat([entry])
    .sort(function (a, b) {
      return b.score - a.score;
    })
    .slice(0, MAX_TOP);
  var newBoard = { top: top, updated: entry.ts };
  await env.SCORES.put(SCORE_KEY, JSON.stringify(newBoard));
  var view = boardView(newBoard);
  view.isHighScore = score > prevHigh;
  view.madeBoard = top.indexOf(entry) !== -1;
  view.rank = top.indexOf(entry) + 1;
  return scoreJson(view, 200);
}

async function handleResetScores(request, env) {
  if (!env.SCORES) {
    return scoreJson({ message: "Scoreboard is not configured." }, 503);
  }
  if (!(await verifyAccessJwt(request, env))) {
    return scoreJson({ message: "Unauthorized: owner sign-in required." }, 401);
  }
  await env.SCORES.put(SCORE_KEY, JSON.stringify({ top: [], updated: new Date().toISOString() }));
  return scoreJson({ ok: true, top: [] }, 200);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    /* One canonical host: www has separate cookies/storage from the apex,
       which splits login state and confuses the admin. Redirect it. */
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }
    /* Public scoreboard (NOT under /api*, so not gated by Cloudflare Access
       — players must be able to read and submit without signing in). */
    if (url.pathname === "/scores") {
      if (request.method === "GET") {
        return handleGetScores(env);
      }
      if (request.method === "POST") {
        return handlePostScore(request, env);
      }
      return scoreJson({ message: "Method not allowed." }, 405);
    }
    /* Owner-only reset lives under /api* so Cloudflare Access gates it, and
       the Worker double-checks the Access JWT. */
    if (url.pathname === "/api/scores/reset" && request.method === "POST") {
      return handleResetScores(request, env);
    }
    if (url.pathname === "/api/graphql" || url.pathname.startsWith("/api/v3/")) {
      return proxyGithub(request, env, url);
    }
    const resp = await env.ASSETS.fetch(request);
    /* The admin shell must never be served stale — outdated copies have
       old sign-in logic. Force revalidation on every load (it's tiny). */
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      const headers = new Headers(resp.headers);
      headers.set("cache-control", "no-cache");
      return new Response(resp.body, { status: resp.status, headers });
    }
    return resp;
  },
};
