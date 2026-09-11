/**
 * Landing copy and type rules.
 *
 * Casing:
 * - Brand lockup (header, hero, footer): title case "Hack the Andes"
 * - Section titles: display font + CSS uppercase for HUD rhythm
 * - HUD chrome / meta: IBM Plex Mono, uppercase, wide tracking
 * - Body and supporting lines: sentence-case Spanish
 * - CLI commands and the agent prompt stay English
 *
 * Color roles: blue field, yellow status/CTA, white type and rules.
 */

/** Approximate USD→PEN mid-market rate, early September 2026. */
export const usdToPenRate = 3.35;

export const prizeAmountsUsd = {
  first: 2_000,
  second: 500,
  travelPool: 300,
} as const;

export const prizeAmountsPen = {
  first: Math.round(prizeAmountsUsd.first * usdToPenRate),
  second: Math.round(prizeAmountsUsd.second * usdToPenRate),
  travelPool: Math.round(prizeAmountsUsd.travelPool * usdToPenRate),
} as const;

export const formatSoles = (amount: number): string =>
  `S/. ${amount.toLocaleString("es-PE")}`;

export const brandName = "Hack the Andes";

export const metadataCopy = {
  title: brandName,
  description:
    "Hackathon selectivo de IA en Lima, 17–18 de octubre 2026. Aplica con la CLI o con tu agent.",
} as const;

export const cliCommands = [
  "npm install --global chofex-cli@latest",
  "chofex login",
  "chofex register",
] as const;

export const hudChrome = {
  unit: "unidad",
  scan: "escaneo",
  live: "en vivo",
  locked: "Bloqueado",
} as const;

export const skipLinks = [
  { href: "#contenido", label: "Saltar al contenido" },
  { href: "#apply", label: "Saltar a aplicar" },
] as const;

export const sectionNav = [
  { href: "#why", label: "Por qué" },
  { href: "#scan", label: "Preselección" },
  { href: "#prizes", label: "Premios" },
  { href: "#apply", label: "Aplicar" },
] as const;

export const worldChapters = [
  { id: "hero", label: "Cumbre", progress: 0 },
  { id: "valley", label: "Valle", progress: 0.34 },
  { id: "scan", label: "Escaneo", progress: 0.64 },
] as const;

export const facts = [
  { label: "Cuándo", value: "17–18 oct 2026" },
  { label: "Dónde", value: "Lima, Perú · presencial" },
  { label: "Equipos", value: "1–4 personas · solos OK" },
  { label: "Duración", value: "~30 horas" },
] as const;

export const heroCopy = {
  channel: "hta / mundo-01 / machu picchu",
  navStatus: "navegación activa",
  eyebrow: "la élite · lima",
  titleLead: "Hack the",
  titleAccent: "Andes",
  lede: "No vienes a mirar. Vienes a construir.",
  meta: "Hackathon selectivo de IA · Lima, Perú · 17–18 oct 2026",
  cta: "Aplicar ahora",
  ctaMeta: "17–18 oct 2026 · presencial",
  sponsor: "con el apoyo de chofex",
  skipToWhy: "Bajar a por qué entrar",
} as const;

export const valleySignal = {
  code: "V-01",
  mark: "FILTRO",
  title: "Admisión selectiva",
  body: "Filtra por rigor. Si el sistema no aguanta, no entra.",
  accent: "yellow",
} as const;

export const expeditionSignals = [
  {
    code: "V-01",
    mark: "FILTRO",
    accent: "yellow",
    title: "Admisión selectiva",
    body: "No basta con inscribirse. Buscamos al talento que ya está construyendo.",
  },
  {
    code: "V-02",
    mark: "CONSEJO",
    accent: "blue",
    title: "Mentores y jueces de alto calibre",
    body: "Gente que ha shipped producto real — no un panel decorativo. El roster se anuncia pronto.",
  },
  {
    code: "V-03",
    mark: "CAMPUS",
    accent: "yellow",
    title: "Comida, espacio y zonas para pensar",
    body: "Comer bien, silencio, música y un lugar para recargar. El resto del tiempo, shippear.",
  },
  {
    code: "V-04",
    mark: "PRUEBA",
    accent: "blue",
    title: "Badges digitales y fotos al instante",
    body: "Te llevas prueba de que estuviste. Lista para compartir.",
  },
] as const;

export const whyCopy = {
  kicker: "valle / señales",
  title: "Por qué esta expedición",
  lede: "Una hackathon para quienes llegan más lejos. Mentores y jueces de alto calibre — el consejo se anuncia pronto.",
  rosterNote: "Consejo de mentores y jueces: se anuncia pronto.",
} as const;

export const filterSignals = [
  {
    title: "Challenge técnico",
    body: "Un filtro que se siente. Si puedes, se nota.",
  },
  {
    title: "Golden tickets",
    body: "Algunos ya se ganaron el asiento. El resto lo demuestra.",
  },
  {
    title: "Juegos entre participantes",
    body: "La preselección también se juega. Pistas, no manual.",
  },
] as const;

export const scanCopy = {
  kicker: "escaneo / hud",
  index: "02 / 08",
  title: "Preselección",
  lede: "El filtro empieza ahora. Algunos llegan por un challenge. Otros, por un golden ticket. El resto, demostrando en público. Las reglas exactas no caben en una landing.",
  factsWindow: "ventana / datos",
  telemetry: "telemetría",
  overlayKicker: "escaneo / talento",
  trackLabel: "Pista",
} as const;

export const trackHints = [
  {
    code: "T-01",
    hint: "Una línea que se comporta como montaña — o como señal.",
  },
  {
    code: "T-02",
    hint: "Nodos que se buscan. El mapa no está publicado.",
  },
] as const;

export const applyCopy = {
  kicker: "aplicar / ventana",
  title: "Aplica ahora",
  lede: "Aplica con la CLI o dile a tu agent.",
  cliTitle: "Aplica con la CLI",
  agentKicker: "agent",
  agentTitle: "O dile a tu agent",
} as const;

export const prizesCopy = {
  title: "Premios",
  pozo: "pozo de premios",
  firstPlace: "S/. en 1er lugar",
  travel: "viaje / minijuegos",
} as const;

export const sponsorsCopy = {
  kicker: "patrocinio / ficha",
  title: "Sponsors",
  lede: "Con el apoyo de Chofex. Identidad propia del evento. Chofex patrocina — no pinta la paleta.",
} as const;

export const footerCopy = {
  meta: "lima · 17–18 oct 2026 · con el apoyo de chofex",
  legalLabel: "Legal",
  terms: "Términos",
  privacy: "Privacidad",
} as const;

export const chromeCopy = {
  menu: "Menú",
  close: "Cerrar",
  sections: "Secciones",
  worldChapters: "Capítulos del terreno",
  apply: "Aplicar",
} as const;

export const marqueeSignals = ["selectivo", "Lima", "1–4", "~30h"] as const;

export const marqueePressure = [
  "pocas plazas",
  "presión real",
  "presencial",
] as const;

export const sponsorSlots = [
  { id: "chofex", name: "Chofex", confirmed: true },
  { id: "open-1", name: "Más sponsors pronto", confirmed: false },
] as const;
