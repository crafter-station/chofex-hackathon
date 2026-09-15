import {
  Barlow_Condensed,
  Google_Sans_Flex,
  IBM_Plex_Mono,
  Stack_Sans_Notch,
} from "next/font/google";

/**
 * The brand face, and only the event's name: the hero lockup and the wordmark
 * in the header and the footer. Section titles stay on the condensed display
 * face, which is what the rest of the page's headings are cut from.
 *
 * Loaded variable across its full 200-700 range rather than at fixed weights,
 * so the lockup and a card heading can sit at different weights for one file.
 * `latin-ext` is not optional here — the titles are Spanish, and it is the
 * subset that carries the accents and the enye.
 */
export const landingBrand = Stack_Sans_Notch({
  subsets: ["latin", "latin-ext"],
  variable: "--font-landing-brand",
  display: "swap",
});

export const landingDisplay = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-landing-display",
});

/**
 * Body copy.
 *
 * Loaded as a variable font with no fixed weights: it carries 1 to 1000 on the
 * weight axis in one file, so asking for four cuts would fetch four static
 * instances of a face that ships them all. Only the weight axis comes down —
 * the family also has grade, roundness, optical size, slant and width, and
 * none of them are used here.
 */
export const landingSans = Google_Sans_Flex({
  subsets: ["latin", "latin-ext"],
  variable: "--font-landing-sans",
  display: "swap",
});

export const landingMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-landing-mono",
});
