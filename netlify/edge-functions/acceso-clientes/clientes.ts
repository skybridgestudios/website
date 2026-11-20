// Clients with a private demo on skybridgestd.space.
//
// Each client lives in public/clientes/<slug>/ and is opened with an access link:
//   https://www.skybridgestd.space/clientes/<slug>/?acceso=KEY
// Keys are never stored here. They live in Netlify:
//   Site configuration → Environment variables → the name given in `envKey`.
// One or more keys separated by spaces (give each person their own key).
//
// To add a client: copy plantilla-cliente/ to public/clientes/<slug>/, add an entry
// below, create the environment variable, redeploy, and send the access link.

export type Cliente = {
  /** Shown in the link preview and the denied page title. */
  nombre: string;
  /** Environment variable holding the access keys (space-separated). */
  envKey: string;
  /** Optional environment variable with an end date, e.g. 2027-01-31. */
  envUntil?: string;
  /** Cookie name. Keep it once a link has been shared, or visitors lose access. */
  cookie: string;
  /** Page opened by the access link, relative to the client folder. "" = the portal page. */
  entrada: string;
  /** Link preview shown by WhatsApp, iMessage and email apps. */
  og: { title: string; description: string; image: string; theme: string; locale?: string };
  /** Files anyone may open without a key (the link preview image). Paths in lowercase. */
  publicos?: string[];
  /** Old addresses of this demo that must keep working. Paths in lowercase. */
  legacy?: string[];
  /** Other paths that only this client's visitors may open, e.g. screenshots. */
  extraProtected?: string[];
  /** When the real site is live, visitors with access are sent there. */
  launchedUrl?: string | null;
};

export const CLIENTES: Record<string, Cliente> = {
  "digital-accounting-tax": {
    nombre: "Digital Accounting & Tax",
    envKey: "DAT_ACCESS_KEY",
    envUntil: "DAT_ACCESS_UNTIL",
    cookie: "dat_acceso", // same cookie as before the move, so nobody has to open the link again
    entrada: "",
    og: {
      title: "Digital Accounting & Tax: website proposal",
      description: "Private demo prepared by Skybridge Digital Studios. Available in English and Spanish.",
      image: "/clientes/digital-accounting-tax/preview.jpg",
      theme: "#0A1A2F",
    },
    publicos: ["/clientes/digital-accounting-tax/preview.jpg"],
    legacy: ["/digital-accounting-tax"], // the first link sent to Carlos
    extraProtected: ["/work/dat-"], // remove when the client approves a public case study
    launchedUrl: null,
  },
};
