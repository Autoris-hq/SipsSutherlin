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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    /* One canonical host: www has separate cookies/storage from the apex,
       which splits login state and confuses the admin. Redirect it. */
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
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
