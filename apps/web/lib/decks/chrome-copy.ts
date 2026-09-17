import type { DeckLang } from "./loader";

/**
 * Every string the deck system itself puts on screen.
 *
 * The slides are written in whatever language their deck is; the chrome around
 * them — the index, the pager's labels, the skip link — was hardcoded Spanish,
 * so the English deck shipped with an "ÍNDICE" button and tiers reading
 * "2 disponibles". A deck sent to an international devtool cannot do that.
 *
 * It is a plain record rather than an i18n library on purpose. There are eight
 * strings and two languages, the app has no i18n runtime, and adding one to
 * translate a button would be the largest dependency in the deck system.
 */
export type DeckChromeCopy = {
  skipToDeck: string;
  index: string;
  indexDialog: string;
  closeIndex: string;
  previousSlide: string;
  nextSlide: string;
  /** Singular and plural of the unit in "×6 · 6 available". */
  available: readonly [singular: string, plural: string];
};

const COPY: Record<DeckLang, DeckChromeCopy> = {
  es: {
    skipToDeck: "Saltar controles — ir al inicio del deck",
    index: "Índice",
    indexDialog: "Índice de diapositivas",
    closeIndex: "Cerrar índice",
    previousSlide: "Diapositiva anterior",
    nextSlide: "Diapositiva siguiente",
    available: ["disponible", "disponibles"],
  },
  en: {
    skipToDeck: "Skip the controls — go to the start of the deck",
    index: "Index",
    indexDialog: "Slide index",
    closeIndex: "Close index",
    previousSlide: "Previous slide",
    nextSlide: "Next slide",
    available: ["open", "open"],
  },
};

export function chromeCopy(lang: DeckLang): DeckChromeCopy {
  return COPY[lang];
}

/** "6 disponibles" / "6 open", given the count as it was authored. */
export function availableLabel(count: string, lang: DeckLang): string {
  const [singular, plural] = COPY[lang].available;
  return `${count} ${count === "1" ? singular : plural}`;
}
