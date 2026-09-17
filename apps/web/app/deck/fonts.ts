import { DM_Mono } from "next/font/google";

/**
 * The deck's body face.
 *
 * It lives here rather than in `components/landing/fonts.ts` because it is the
 * one face the two surfaces do not share: the landing sets body copy in Google
 * Sans Flex, and the sponsorship decks set it in this. Everything else in the
 * deck's stack — the brand face, the condensed display, the mono — comes from
 * the landing module, so a change there still reaches the decks.
 *
 * The design base specifies Glock Grotesk, which cannot be served: the freely
 * available cut is a personal-use demo of 187 glyphs and one weight, and it
 * carries no Spanish accents at all, no `$` and no `%`. This is the substitute.
 *
 * A monospace where the base used a proportional face, and chosen for that: the
 * base sets the body in a wide, airy display face against a clean grotesque, so
 * the contrast between the two voices is what the page is built on. Stack Sans
 * Notch carries the headings here, and a second grotesque underneath it reads
 * as the same voice at a smaller size. The cost is density — the mono runs
 * about five lines where a proportional face runs three — which is affordable
 * because a sponsorship slide carries phrases and figures, not paragraphs.
 *
 * `latin-ext` is not optional: it is the subset that carries the accents this
 * deck's Spanish is full of. Three static weights, because the family is not
 * variable and asking for a range would silently fetch nothing.
 */
export const deckBody = DM_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  variable: "--font-deck-body",
  display: "swap",
});
