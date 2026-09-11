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

export const cliCommands = [
  "npm install --global chofex-cli@latest",
  "chofex login",
  "chofex register",
] as const;

export const facts = [
  { label: "Cuándo", value: "10–11 oct 2026" },
  { label: "Dónde", value: "Lima, Perú · presencial" },
  { label: "Equipos", value: "1–4 personas · solos OK" },
  { label: "Duración", value: "~30 horas" },
] as const;

export const differentiators = [
  {
    title: "Admisión selectiva",
    body: "No basta con inscribirse. Buscamos al talento que ya está construyendo.",
  },
  {
    title: "Mentores y jueces de alto calibre",
    body: "Gente que ha shipped producto real — no un panel decorativo.",
  },
  {
    title: "Comida, espacio y zonas para pensar",
    body: "Comer bien, silencio, música y un lugar para recargar. El resto del tiempo, shippear.",
  },
  {
    title: "Badges digitales y fotos al instante",
    body: "Te llevas prueba de que estuviste. Lista para compartir.",
  },
] as const;

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
