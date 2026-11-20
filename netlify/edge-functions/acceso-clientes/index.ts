// Private access to client demos under /clientes/<slug>/.
//
// Only someone who opens an access link (…/clientes/<slug>/?acceso=KEY) gets in.
// The function checks the key (capital letters don't matter), saves a 30-day cookie,
// removes the key from the address bar and opens the client's portal page. Everyone
// else gets a plain "page not available" (404), with no HTML or styles from the demo.
// The only public file per client is its link preview image.
//
// Clients and their settings are listed in ./clientes.ts. Keys live in Netlify
// environment variables, never in this repository. If a client's key variable is
// missing or its end date has passed, that demo is closed to everyone (fails closed).
// To cut off access: change or delete the key variable and redeploy. Old cookies stop
// working because they hold a hash of the old key.

import { CLIENTES, type Cliente } from "./clientes.ts";

const BASE = "/clientes/";
const PARAM = "acceso";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const DENIED_HTML = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Página no disponible</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f5f3;color:#1d2420;
    font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
  main{max-width:30em;padding:32px;text-align:center}
  h1{font-size:1.4rem;margin:0 0 8px}
  p{margin:0 0 6px;color:#56605a}
  a{color:#1f6b45}
</style></head>
<body><main>
  <h1>Esta página no está disponible</h1>
  <p>Si recibiste un enlace de acceso, ábrelo otra vez desde el mensaje original.</p>
  <p lang="en">This page is not available. If you received an access link, open it again from the original message.</p>
  <p><a href="/">Ir al inicio / Go to the home page</a></p>
</main></body></html>`;

declare const Netlify: { env: { get(name: string): string | undefined } };

type Match = {
  slug: string;
  c: Cliente;
  /** The client's folder, e.g. /clientes/digital-accounting-tax */
  home: string;
  /** The request path rewritten to the current folder when it used an old address. */
  legacyTarget: string | null;
};

const normalize = (key: string) => key.trim().toLowerCase();

function escapeAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const under = (path: string, prefix: string) => path === prefix || path.startsWith(prefix + "/");

// Which client a (lowercased, decoded) path belongs to, if any.
function findClient(path: string, rawPath: string): Match | null {
  for (const [slug, c] of Object.entries(CLIENTES)) {
    const home = BASE + slug;
    if (under(path, home)) return { slug, c, home, legacyTarget: null };
    for (const old of c.legacy ?? []) {
      if (under(path, old)) return { slug, c, home, legacyTarget: home + rawPath.slice(old.length) };
    }
    if ((c.extraProtected ?? []).some((p) => path.startsWith(p))) return { slug, c, home, legacyTarget: null };
  }
  return null;
}

// Files whose name carries a content hash (font-4c4d14ec9d.woff2) never change, so the
// visitor's browser may keep them for a year. Other assets (site.css, site.js) are kept
// but checked with the server on each visit. HTML pages are never stored, so a revoked
// key takes effect at once. (Storing nothing at all made the fonts download again on
// every reload, and the text visibly switched typefaces.)
function cacheFor(pathname: string): string {
  if (/-[0-9a-f]{8,}\.(woff2?|png|jpe?g|webp|avif|svg|css|js)$/i.test(pathname)) {
    return "private, max-age=31536000, immutable";
  }
  if (/\.(woff2?|png|jpe?g|webp|avif|svg|gif|ico|css|js)$/i.test(pathname)) {
    return "private, no-cache";
  }
  return "private, no-store";
}

// Page returned to a valid access link. People are sent on at once; link-preview
// bots (WhatsApp, iMessage, email) read the title and image instead of a 404.
function welcome(origin: string, c: Cliente, target: string): string {
  const t = escapeAttr(target);
  const og = c.og;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${escapeAttr(og.title)}</title>
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeAttr(og.title)}">
<meta property="og:description" content="${escapeAttr(og.description)}">
<meta property="og:image" content="${escapeAttr(origin + og.image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${escapeAttr(og.theme)}">
<meta http-equiv="refresh" content="0;url=${t}">
<script>location.replace(${JSON.stringify(target).replace(/</g, "\\u003c")})</script>
<style>body{margin:0;min-height:100vh;background:${escapeAttr(og.theme)}}</style>
</head><body><noscript><a href="${t}">Open the site</a></noscript></body></html>`;
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function sameString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

function denied(): Response {
  return new Response(DENIED_HTML, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

function redirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { location, "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
}

function expired(until: string | undefined): boolean {
  if (!until) return false;
  const end = new Date(until + (until.length === 10 ? "T23:59:59-05:00" : ""));
  return !isNaN(end.getTime()) && Date.now() > end.getTime();
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const url = new URL(request.url);
  let path: string;
  try {
    path = decodeURIComponent(url.pathname).toLowerCase();
  } catch {
    return denied(); // malformed path
  }

  const m = findClient(path, url.pathname);
  if (!m) {
    // Unknown client folders (and /clientes/ itself) stay closed; the rest of the site is untouched.
    return under(path, BASE.slice(0, -1)) ? denied() : undefined;
  }
  const { c, home } = m;

  // The link preview image is public. Under an old address it is served from the new folder.
  const publicPath = m.legacyTarget ? m.legacyTarget.toLowerCase() : path;
  if ((c.publicos ?? []).includes(publicPath)) {
    return m.legacyTarget ? new URL(m.legacyTarget, url) : undefined;
  }

  const keys = (Netlify.env.get(c.envKey) ?? "").split(/\s+/).filter(Boolean).map(normalize);
  if (keys.length === 0) return denied();
  if (c.envUntil && expired(Netlify.env.get(c.envUntil))) return denied();

  const validHashes = await Promise.all(keys.map(sha256));
  const matches = (hash: string) => validHashes.some((h) => sameString(h, hash));

  // 1. Arriving with the access link: check it, save the cookie, clean the URL.
  const given = url.searchParams.get(PARAM);
  if (given !== null) {
    const hash = await sha256(normalize(given));
    if (!matches(hash)) return denied();
    url.searchParams.delete(PARAM);
    const asked = m.legacyTarget ?? url.pathname;
    // The front door (the folder itself) opens the client's chosen entry page.
    const isFrontDoor = new RegExp(`^${home}/?(index\\.html)?$`, "i").test(asked);
    const target = c.launchedUrl ?? (isFrontDoor ? `${home}/${c.entrada}` : asked) + url.search;
    return new Response(welcome(url.origin, c, target), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "set-cookie": `${c.cookie}=${hash}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        "cache-control": "no-store",
        "referrer-policy": "no-referrer",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  // 2. Returning visit with a valid cookie.
  const cookie = readCookie(request.headers.get("cookie"), c.cookie);
  if (cookie && matches(cookie)) {
    if (c.launchedUrl) return redirect(c.launchedUrl);
    if (m.legacyTarget) return redirect(m.legacyTarget + url.search);
    const response = await context.next();
    response.headers.set("cache-control", cacheFor(url.pathname));
    response.headers.set("x-robots-tag", "noindex, nofollow");
    return response;
  }

  // 3. Anyone else.
  return denied();
};

export const config = { path: "/*" };
