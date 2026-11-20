// Private access to the Digital Accounting & Tax demo.
//
// Only someone who opens the access link (…/Digital-Accounting-Tax/?acceso=KEY)
// gets in. The function checks the key (capital letters don't matter), saves a
// 30-day cookie, removes the key from the address bar and opens the English home
// page (the visitor can switch to Spanish there). Everyone else gets a plain "page not available" (404), with no HTML or
// styles from the demo. The only public file is preview.jpg, the image WhatsApp,
// iMessage and email apps show as the link preview.
//
// Settings live in Netlify (Site configuration → Environment variables), never in
// this repository:
//   DAT_ACCESS_KEY    one or more keys separated by spaces (required)
//   DAT_ACCESS_UNTIL  optional end date, e.g. 2027-01-31; after it nobody gets in
//
// To cut off access: change or delete DAT_ACCESS_KEY and redeploy. Old cookies stop
// working because they hold a hash of the old key.
// If DAT_ACCESS_KEY is missing, the demo stays closed to everyone (fails closed).

const PROTECTED = ["/digital-accounting-tax", "/work/dat-"];
const PARAM = "acceso";
const COOKIE = "dat_acceso";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const PUBLIC_FILES = ["/digital-accounting-tax/preview.jpg"]; // link preview image only

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

function isProtected(pathname: string): boolean {
  let path: string;
  try {
    path = decodeURIComponent(pathname).toLowerCase();
  } catch {
    return true; // malformed path: treat as protected, it will be denied
  }
  if (PUBLIC_FILES.includes(path)) return false;
  return PROTECTED.some((p) => path.startsWith(p));
}

const normalize = (key: string) => key.trim().toLowerCase();

function escapeAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// Page returned to a valid access link. People are sent on at once; link-preview
// bots (WhatsApp, iMessage, email) read the title and image instead of a 404.
function welcome(origin: string, target: string): string {
  const t = escapeAttr(target);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Digital Accounting &amp; Tax: website proposal</title>
<meta property="og:type" content="website">
<meta property="og:title" content="Digital Accounting &amp; Tax: website proposal">
<meta property="og:description" content="Private demo prepared by Skybridge Digital Studios. Available in English and Spanish.">
<meta property="og:image" content="${escapeAttr(origin)}/Digital-Accounting-Tax/preview.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0A1A2F">
<meta http-equiv="refresh" content="0;url=${t}">
<script>location.replace("${t}")</script>
<style>body{margin:0;min-height:100vh;background:#0A1A2F}</style>
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

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const url = new URL(request.url);
  if (!isProtected(url.pathname)) return; // the rest of the site is untouched

  const keys = (Netlify.env.get("DAT_ACCESS_KEY") ?? "").split(/\s+/).filter(Boolean).map(normalize);
  if (keys.length === 0) return denied();

  const until = Netlify.env.get("DAT_ACCESS_UNTIL");
  if (until) {
    const end = new Date(until + (until.length === 10 ? "T23:59:59-05:00" : ""));
    if (!isNaN(end.getTime()) && Date.now() > end.getTime()) return denied();
  }

  const validHashes = await Promise.all(keys.map(sha256));
  const matches = (hash: string) => validHashes.some((h) => sameString(h, hash));

  // 1. Arriving with the access link: check it, save the cookie, clean the URL.
  const given = url.searchParams.get(PARAM);
  if (given !== null) {
    const hash = await sha256(normalize(given));
    if (!matches(hash)) return denied();
    url.searchParams.delete(PARAM);
    // The demo's front door always opens the English home page, on phones and computers.
    const isFrontDoor = /^\/digital-accounting-tax\/?(index\.html)?$/i.test(url.pathname);
    const target = isFrontDoor ? "/Digital-Accounting-Tax/en/index.html" + url.search : url.pathname + url.search;
    return new Response(welcome(url.origin, target), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "set-cookie": `${COOKIE}=${hash}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        "cache-control": "no-store",
        "referrer-policy": "no-referrer",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  // 2. Returning visit with a valid cookie: serve the page, never from a shared cache.
  const cookie = readCookie(request.headers.get("cookie"), COOKIE);
  if (cookie && matches(cookie)) {
    const response = await context.next();
    response.headers.set("cache-control", "private, no-store");
    response.headers.set("x-robots-tag", "noindex, nofollow");
    return response;
  }

  // 3. Anyone else.
  return denied();
};

export const config = { path: "/*" };
