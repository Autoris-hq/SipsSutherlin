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

async function verifyAccessJwt(request, env) {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) {
    return false; // fail closed until Access details are configured
  }
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
    const res = await fetch(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`);
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
    return new Response("GitHub proxy is not configured (missing GITHUB_TOKEN).", { status: 503 });
  }
  if (!(await verifyAccessJwt(request, env))) {
    return new Response("Unauthorized", { status: 401 });
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
  const respHeaders = new Headers(upstream.headers);
  respHeaders.delete("set-cookie");
  return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/graphql" || url.pathname.startsWith("/api/v3/")) {
      return proxyGithub(request, env, url);
    }
    return env.ASSETS.fetch(request);
  },
};
