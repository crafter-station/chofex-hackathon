/**
 * Landing copy and type rules.
 *
 * Casing:
 * - Brand lockup (header, hero, footer): title case "Hack the Andes"
 * - Section titles: display font + CSS uppercase
 * - Kickers: IBM Plex Mono, uppercase, wide tracking
 * - Body: sentence-case Spanish
 * - CLI commands and the agent prompt stay English
 *
 * Color roles: Sandy Linen paper, Aegean actions, Scarlet accent, ink type.
 */

export const prizeAmountsUsd = {
  first: 2_000,
  second: 500,
} as const;

export const prizeAmountsPen = {
  first: 6_700,
  second: 1_675,
} as const;

const solesFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
});

export const formatSoles = (amount: number): string =>
  solesFormatter.format(amount);

export const brandName = "Hack the Andes";

export const seatCount = 100;
export const challengeCount = 3;
export const judgeCount = 5;
export const mentorCount = 5;

export const metadataCopy = {
  title: `${brandName} — Lima, 17–18 oct 2026`,
  description:
    "100 cupos para AI, product y software engineers con experiencia. 3 challenges, 30 horas y una entrega funcionando. Sponsor principal: Chofex.",
} as const;

export const cliCommands = [
  "npm install --global chofex-cli@latest",
  "chofex login",
  "chofex register",
] as const;

export const skipLinks = [
  { href: "#contenido", label: "Saltar al contenido" },
  { href: "#apply", label: "Saltar a aplicar" },
] as const;

export const sectionNav = [
  { href: "#why", label: "Evento" },
  { href: "#challenges", label: "Challenges" },
  { href: "#people", label: "Consejo" },
  { href: "#prizes", label: "Premios" },
  { href: "#experience", label: "Experiencia" },
  { href: "#apply", label: "Aplicar" },
] as const;

export const facts = [
  { label: "Cupos", value: String(seatCount) },
  { label: "Fecha", value: "17–18 oct 2026" },
  { label: "Formato", value: "Presencial · Lima" },
  { label: "Equipos", value: "1–4 personas" },
] as const;

export const heroCopy = {
  channel: "Valle Sagrado · Cusco",
  eyebrow: "Hackathon presencial · Lima",
  titleLead: "Hack the",
  titleAccent: "Andes",
  /*
   * Three facts, three lines, each with its number carrying the weight.
   *
   * It was one sentence — "100 builders con experiencia. 3 challenges. 30
   * horas para entregar algo que funcione." — which wrapped to two ragged
   * lines on a phone and asked the reader to parse three claims out of a
   * paragraph. Split, each one is a glance.
   */
  claims: [
    { figure: "100", label: "builders con experiencia" },
    { figure: "3", label: "challenges" },
    { figure: "30", label: "horas para entregar algo que funcione" },
  ],
  meta: "17–18 de octubre de 2026 · Lima, Perú",
  cta: "Postular",
  sponsor: "Sponsor principal · Chofex",
  organizer: "Organiza · Crafter Station",
  skipToWhy: "Conocer el evento",
} as const;

export const audienceCopy = {
  kicker: "el estándar",
  title: "Para quienes ya construyen",
  lede: "Buscamos experiencia demostrable, criterio técnico y capacidad para llevar una idea hasta producción. El cargo importa menos que lo que ya hiciste.",
  proof:
    "La postulación pregunta por un producto que ya lanzaste, lo que construirías en la hackathon y cómo tomas decisiones.",
} as const;

export const audienceRoles = [
  {
    title: "AI engineers",
    body: "Agents, evaluación, datos e inferencia. Sistemas de IA que resuelven un problema real.",
  },
  {
    title: "Product engineers",
    body: "Del problema a la interfaz y al código. Criterio de producto en cada decisión técnica.",
  },
  {
    title: "Software engineers",
    body: "Arquitectura, plataformas y confiabilidad. Sistemas que funcionan más allá de la demo.",
  },
] as const;

export const challengesCopy = {
  kicker: "los briefs",
  title: "3 challenges sellados",
  lede: "Las personas aceptadas conocerán los 3 briefs al iniciar la hackathon. Cada equipo elegirá uno y tendrá 30 horas para entregar un producto funcionando.",
  sealed: "Brief sellado",
  reveal: "Se revela en Lima · 17 oct",
} as const;

export const challengeSeats = [
  {
    index: "01",
    hint: "Una señal cambia. Tu sistema tiene que entenderla y responder.",
  },
  {
    index: "02",
    hint: "Hay nodos que todavía no se encuentran. Construye el puente.",
  },
  {
    index: "03",
    hint: "La interfaz es parte del problema. El producto también es la respuesta.",
  },
] as const;

export const peopleCopy = {
  kicker: "el consejo",
  title: "10 personas para elevar el trabajo",
  lede: "5 jurados evaluarán producto, ingeniería e impacto. 5 mentores acompañarán a los equipos durante la construcción.",
  judges: "Jurado",
  mentors: "Mentores",
  judgeRole: "Juez",
  mentorRole: "Mentor",
  reveal: "Nombre por revelar",
  announcement: "Anuncios próximamente",
} as const;

export const judgeSeats = [1, 2, 3, 4, 5] as const;
export const mentorSeats = [1, 2, 3, 4, 5] as const;

export const applyCopy = {
  kicker: "postulaciones abiertas",
  title: "Postula desde tu terminal",
  lede: "La postulación es parte del filtro. Cuéntanos qué lanzaste, qué construirías aquí y dónde podemos ver tu trabajo.",
  criteriaTitle: "Qué revisamos",
  criteria: [
    "Un producto o sistema que ya pusiste en manos de usuarios.",
    "La claridad con la que explicas decisiones y tradeoffs.",
    "La ambición y viabilidad de lo que quieres construir.",
  ],
  cliTitle: "Ruta directa",
  agentKicker: "agent",
  agentTitle: "Ruta asistida",
} as const;

export const prizesCopy = {
  kicker: "premios en efectivo",
  title: "Premios",
  lede: "Dos premios principales. Sin puntos, créditos ni conversión escondida.",
  firstPlace: "Primer lugar",
  secondPlace: "Segundo lugar",
  opportunity: "Oportunidad adicional",
  opportunityBody:
    "Chofex podrá invitar a equipos destacados a un work trial pagado de 2 semanas en Monterrey o San Francisco. No constituye una oferta de trabajo.",
} as const;

export const sponsorsCopy = {
  kicker: "quiénes lo hacen",
  title: "Chofex",
  lede: "Hack the Andes se realiza con el respaldo de Chofex, la producción de Crafter Station y el apoyo de Peru Tech Week.",
  organizer: "Organiza · Crafter Station",
  mark: "Chofex",
  /*
   * Chofex's two official marks, both on transparent.
   *
   * There is no single "the logo": there is one for dark surfaces and one for
   * light, and picking the wrong one is what forced the old lockup to sit in a
   * cream plate on a black page. The landing is black, so `logoSrc` is the
   * white mark; the black one is here for anywhere that goes back to paper.
   */
  logoSrc: "/sponsors/chofex-white.png",
  logoOnLightSrc: "/sponsors/chofex-black.png",
  logoWidth: 1200,
  logoHeight: 295,
} as const;

/**
 * Who is behind the event, in reading order.
 *
 * Chofex sits in the middle because it is the principal sponsor and the hero
 * gives it the centre; the other two flank it. `role` is not decoration — the
 * hero shows these as logos alone, so it is what carries "which one of these
 * is paying for it and which one is running it" to anyone who cannot see the
 * marks, and it goes into the alt text there.
 *
 * Every mark is white on transparent. A sponsor's logo in a box, or inverted
 * into a colour it does not come in, is the thing their brand guide exists to
 * prevent.
 *
 * `shape` is what lets them be set at one optical size. Two of these are
 * wordmarks four or five times wider than they are tall; Peru Tech Week's is a
 * square lockup stacking three words. Matched on height the square one comes
 * out with type a third the size of the others and unreadable, and matched on
 * width it towers over both — so the stacked one is given its own height.
 */
export const partners = [
  {
    id: "peru-tech-week",
    name: "Peru Tech Week",
    role: "Aliado",
    shape: "stacked",
    href: "https://perutechweek.com",
    logoSrc: "/sponsors/peru-tech-week-white.png",
    logoWidth: 730,
    logoHeight: 600,
  },
  {
    id: "chofex",
    name: "Chofex",
    role: "Sponsor principal",
    shape: "wordmark",
    href: "https://chofex.com",
    logoSrc: "/sponsors/chofex-white.png",
    logoWidth: 1200,
    logoHeight: 295,
  },
  {
    id: "crafter-station",
    name: "Crafter Station",
    role: "Organiza",
    shape: "wordmark",
    href: "https://crafter.station",
    logoSrc: "/sponsors/crafter-station-white.png",
    logoWidth: 1200,
    logoHeight: 233,
  },
] as const;

export const experienceCopy = {
  kicker: "la experiencia",
  title: "30 horas bien cuidadas",
  lede: "Un entorno presencial diseñado para sostener trabajo exigente, conversaciones útiles y una entrega de alto nivel.",
} as const;

export const experienceItems = [
  {
    title: "Equipos de 1–4",
    body: "Puedes postular con equipo, buscar uno al ser aceptado o construir solo.",
  },
  {
    title: "Trabajo profundo",
    body: "Zonas de silencio, música y descanso para elegir cómo quieres avanzar.",
  },
  {
    title: "Comida incluida",
    body: "La operación está pensada para que el equipo se concentre en construir.",
  },
  {
    title: "Presencial en Lima",
    body: "Sede exacta por anunciar. El evento será completamente presencial.",
  },
] as const;

export const faqCopy = {
  kicker: "antes de postular",
  title: "Lo esencial",
} as const;

export const faqItems = [
  {
    question: "¿Tengo que tener el cargo de senior?",
    answer:
      "No. Buscamos evidencia de experiencia y autonomía, no una palabra en LinkedIn.",
  },
  {
    question: "¿Necesito un equipo?",
    answer:
      "No. Los equipos pueden tener de 1 a 4 personas y podrás conectar con otros participantes aceptados.",
  },
  {
    question: "¿Cuándo se revelan los challenges?",
    answer:
      "Al iniciar la hackathon, el 17 de octubre. Los equipos aceptados conocerán los 3 briefs y elegirán uno.",
  },
  {
    question: "¿Cómo se seleccionan los 100 cupos?",
    answer:
      "Revisaremos lo que ya construiste, tu criterio al explicarlo y la propuesta que llevarías a la hackathon.",
  },
] as const;

export const footerCopy = {
  meta: "Lima · 17–18 oct 2026 · Sponsor principal: Chofex",
  legalLabel: "Legal",
  // Both terrain sources are attribution-required licences, so these two
  // credits are a condition of use, not decoration.
  /*
   * The elevation model, and the only source left to credit. The Sentinel-2
   * drape was credited here too until the drawing stopped sampling it and the
   * imagery came out of the mesh: CC BY asks for attribution when the work is
   * distributed, and it is no longer in anything a visitor downloads.
   */
  terrainCredit: "Terreno: Mapzen / USGS",
  terms: "Términos",
  privacy: "Privacidad",
} as const;

export const chromeCopy = {
  menu: "Menú",
  close: "Cerrar",
  sections: "Secciones",
  apply: "Aplicar",
} as const;
