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

export const prizePoolHeadlinePen = 8_000;

const solesFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 0,
});

export const formatSoles = (amount: number): string =>
  solesFormatter.format(amount);

export const brandName = "Hack the Andes";

export const seatCount = 100;
export const trackCount = 5;
export const qualifierChallengeCount = 5;

export const metadataCopy = {
  title: `${brandName} — Lima, 17–18 oct 2026`,
  description:
    "100 cupos para AI, product y software engineers con experiencia. 5 tracks, 30 horas y una entrega funcionando.",
} as const;

export const cliCommands = [
  "npm install --global chofex-cli@latest",
  "chofex login",
  "chofex register",
  "chofex status",
] as const;

export const skipLinks = [
  { href: "#contenido", label: "Saltar al contenido" },
  { href: "#apply", label: "Saltar a aplicar" },
] as const;

/** Locked jump order: Evento → Premios → Panel → Tracks → Challenges → Postular → FAQs → Organizadores. */
export const sectionNav = [
  { href: "#why", label: "Evento" },
  { href: "#prizes", label: "Premios" },
  { href: "#people", label: "Panel" },
  { href: "#tracks", label: "Tracks" },
  { href: "#qualifier-challenges", label: "Challenges" },
  { href: "#apply", label: "Postular" },
  { href: "#faq", label: "FAQs" },
  { href: "#sponsors", label: "Organizadores" },
] as const;

export const facts = [
  { label: "Cupos", value: String(seatCount) },
  { label: "Fecha", value: "17–18 oct 2026" },
  {
    label: "Premios",
    value: `Más de ${formatSoles(prizePoolHeadlinePen)}`,
  },
  { label: "Equipos", value: "1–4 personas" },
] as const;

export const heroCopy = {
  titleLead: "Hack the",
  titleAccent: "Andes",
  metaDate: "17–18 oct 2026",
  metaLocation: "Lima, Perú",
  cta: "Postular",
  organizer: "Organiza: Crafter Station",
  skipToWhy: "Conocer el evento",
} as const;

export const eventCopy = {
  title: "Crear soluciones reales para problemas reales",
  lede: "Los verdaderos retos no siempre son los más trending. Requieren tiempo, esfuerzo y creatividad para resolver lo que los demás aceptan como status quo.",
  support:
    "Un entorno presencial diseñado para sostener trabajo exigente, conversaciones útiles y una entrega de alto nivel.",
} as const;

export const eventItems = [
  {
    title: "Ship mata cartón",
    body: "Construyes y lanzas. El filtro es lo que ya pusiste en producción.",
  },
  {
    title: "Equipos de 1–4",
    body: "Puedes postular con equipo, buscar uno al ser aceptado o construir solo.",
  },
  {
    title: "Work hard, Play Hard",
    body: "100 personas, 30 horas, un mismo espacio. Comida incluida, música y zonas de silencio.",
  },
  {
    title: "HardCore Mode",
    body: "30 horas con entrega real. Presencial en Lima, 17–18 de octubre. Sede exacta por anunciar.",
  },
] as const;

export const tracksCopy = {
  title: "5 Tracks centrales",
  subtitle: "∞ Posibilidades de soluciones",
  lede: "Los tracks son los temas de trabajo del día del evento. Las personas aceptadas conocerán los 5 briefs en Lima, elegirán en cuál quieren trabajar y tendrán 30 horas para entregar un producto funcionando.",
  reveal: "Se revela en Lima, 17 oct",
} as const;

export const trackSeats = [
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
  {
    index: "04",
    hint: "Un sistema esencial opera al límite. Encuentra una forma más resiliente.",
  },
  {
    index: "05",
    hint: "Decisiones complejas exigen mejores herramientas. Diseña una que cambie el resultado.",
  },
] as const;

export const qualifierChallengesCopy = {
  title: "Challenges de clasificación",
  subtitle: "Demuestra que estás cracked",
  lede: `Los ${qualifierChallengeCount} challenges son pruebas técnicas individuales que ocurren antes del evento. No son los tracks de la hackathon: aquí compites para demostrar lo que puedes hacer, y los mejores resultados de cada challenge obtienen pase directo al evento.`,
  tracksLabel: "Tracks / durante el evento",
  tracksBody:
    "Son 5 temas para construir en equipo durante 30 horas. Los eliges presencialmente en Lima.",
  challengesLabel: "Challenges / antes del evento",
  challengesBody:
    "Son 5 pruebas técnicas para clasificar. Resuelve una, sube al ranking y compite por un pase directo.",
  liveKicker: "Challenge 1 / live",
  liveTitle: "The Shipping Machine",
  liveBody:
    "Investiga una máquina de precios sin documentación, descubre sus reglas y construye un reemplazo compatible.",
  liveMeta: "25 queries · 3 evaluaciones oficiales · AI permitida",
  liveCta: "Ver reto e instrucciones →",
} as const;

export const peopleCopy = {
  title: "El talento más top de Perú",
  brandsLabel: "Backgrounds",
} as const;

/**
 * Institutional marks for the panel chapter.
 *
 * These are backgrounds, not a confirmed roster. Names and roles stay off the
 * page until each participation is verified. Order is locked: MIT, YC, Google,
 * Meta, Stanford, Microsoft, Harvard, U of Toronto, DP World, Hochschild,
 * Palantir, Artificio.
 */
export const panelBrands = [
  {
    id: "mit",
    name: "MIT",
    shape: "wordmark",
    logoSrc: "/panel/mit.png",
    logoWidth: 120,
    logoHeight: 36,
  },
  {
    id: "yc",
    name: "YC",
    shape: "square",
    logoSrc: "/panel/yc.png",
    logoWidth: 40,
    logoHeight: 40,
  },
  {
    id: "google",
    name: "Google",
    shape: "square",
    logoSrc: "/panel/google.png",
    logoWidth: 40,
    logoHeight: 40,
  },
  {
    id: "meta",
    name: "Meta",
    shape: "wordmark",
    logoSrc: "/panel/meta.png",
    logoWidth: 86,
    logoHeight: 32,
  },
  {
    id: "stanford",
    name: "Stanford",
    shape: "wordmark",
    logoSrc: "/panel/stanford.png",
    logoWidth: 168,
    logoHeight: 36,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    shape: "square",
    logoSrc: "/panel/microsoft.png",
    logoWidth: 40,
    logoHeight: 40,
  },
  {
    id: "harvard",
    name: "Harvard",
    shape: "square",
    logoSrc: "/panel/harvard.png",
    logoWidth: 36,
    logoHeight: 40,
  },
  {
    id: "toronto",
    name: "University of Toronto",
    shape: "wordmark",
    logoSrc: "/panel/toronto.png",
    logoWidth: 720,
    logoHeight: 180,
  },
  {
    id: "dp-world",
    name: "DP World",
    shape: "wordmark",
    logoSrc: "/panel/dp-world.png",
    logoWidth: 156,
    logoHeight: 36,
  },
  {
    id: "hochschild",
    name: "Hochschild",
    shape: "wordmark",
    logoSrc: "/panel/hochschild.png",
    logoWidth: 188,
    logoHeight: 36,
  },
  {
    id: "palantir",
    name: "Palantir",
    shape: "wordmark",
    logoSrc: "/panel/palantir.png",
    logoWidth: 156,
    logoHeight: 36,
  },
  {
    id: "artificio",
    name: "Artificio",
    shape: "wordmark",
    logoSrc: "/panel/artificio.png",
    logoWidth: 156,
    logoHeight: 58,
  },
] as const;

export const applyCopy = {
  title: "Postula desde tu terminal",
  lede: "La postulación regular sigue abierta. Cuéntanos qué lanzaste, qué construirías aquí y dónde podemos ver tu trabajo. Si prefieres demostrarlo construyendo, los mejores resultados de cada challenge reciben pase directo.",
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
  title: "Premios",
  lede: "Premios en efectivo para las soluciones que mejor conviertan un problema real en un producto funcionando.",
  totalSuffix: "en premios en efectivo",
  tripTitle: "Viaje a Chofex Headquarters",
  tripLocation: "(San Francisco, USA y/o Monterrey, Mexico)",
  /*
   * Stacked so "Viaje a" is the trip, and CHOFEX / HEADQUARTERS stay a
   * readable lockup on a ~390px phone — not a 12px afterthought.
   */
  tripLines: ["Viaje a", "Chofex", "Headquarters"],
} as const;

export const sponsorsCopy = {
  kicker: "quiénes lo hacen",
  title: "Chofex",
  lede: "Hack the Andes se realiza con el respaldo de Chofex, la producción de Crafter Station y el apoyo de Peru Tech Week.",
  organizer: "Organiza: Crafter Station",
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
    href: "https://crafter.run",
    logoSrc: "/sponsors/crafter-station-white.png",
    logoWidth: 1200,
    logoHeight: 233,
  },
] as const;

export const faqCopy = {
  title: "Preguntas frecuentes",
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
    question: "¿Cuándo se revelan los tracks?",
    answer:
      "Al iniciar la hackathon, el 17 de octubre. Las personas aceptadas conocerán los 5 briefs y elegirán presencialmente en cuál quieren trabajar.",
  },
  {
    question: "¿Cuál es la diferencia entre tracks y challenges?",
    answer:
      "Los tracks son los temas de trabajo que eliges durante la hackathon. Los challenges son pruebas técnicas previas: los mejores resultados de cada uno obtienen pase directo al evento.",
  },
  {
    question: "¿Cómo se seleccionan los 100 cupos?",
    answer:
      "Revisaremos lo que ya construiste, tu criterio al explicarlo y la propuesta que llevarías a la hackathon.",
  },
] as const;

export const footerCopy = {
  meta: "Lima, 17–18 oct 2026",
  legalLabel: "Legal",
  credits: "Créditos",
  terms: "Términos",
  privacy: "Privacidad",
  ranking: "Challenges",
} as const;

export const chromeCopy = {
  menu: "Menú",
  close: "Cerrar",
  sections: "Secciones",
  apply: "Aplicar",
} as const;
