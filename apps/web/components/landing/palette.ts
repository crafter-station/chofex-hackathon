/**
 * The liquid's four colours, and how they turn over as the valley is flown.
 *
 * The gradient shader keeps two independent fields: *coverage* decides where
 * liquid exists at all (everywhere else is the black void), and *hue* decides
 * what colour it is inside that. These four entries are the hue ramp:
 *
 * - `rim`  a thin deepening right at the black boundary
 * - `low`  the colour the ramp starts from
 * - `edge` a narrow fringe, the only place a light value appears
 * - `bulk` what most of the liquid actually reads as
 *
 * Red and blue are not decoration here — they are the landing's own two
 * colours (`--hud-status` burnt red, `--hud-action` Chofex cobalt) on the black
 * the drawing needs behind it. Scrolling the hero swaps which of the two owns
 * the bulk, so the first station burns red and the last one cools to cobalt
 * without ever introducing a third hue.
 */

export type LiquidPalette = {
  readonly rim: readonly [number, number, number];
  readonly low: readonly [number, number, number];
  readonly edge: readonly [number, number, number];
  readonly bulk: readonly [number, number, number];
};

export function hexToLinear(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  ];
}

const EMBER: LiquidPalette = {
  rim: hexToLinear("#1b0604"),
  low: hexToLinear("#2459c9"),
  edge: hexToLinear("#f3efe7"),
  bulk: hexToLinear("#b83e35"),
};

const COBALT: LiquidPalette = {
  rim: hexToLinear("#04070f"),
  low: hexToLinear("#b83e35"),
  edge: hexToLinear("#e8d9c6"),
  bulk: hexToLinear("#2459c9"),
};

/**
 * The turn between them, and the reason it exists.
 *
 * Crossfading burnt red straight into cobalt walks the bulk through violet —
 * a third hue, on a page that has exactly two. Draining to near-black first and
 * refilling from there keeps the promise: the liquid is red, then it is barely
 * there, then it is blue.
 */
const DUSK: LiquidPalette = {
  rim: hexToLinear("#08050a"),
  low: hexToLinear("#1d1220"),
  edge: hexToLinear("#5d4a52"),
  bulk: hexToLinear("#160d12"),
};

/**
 * The palette down the page.
 *
 * The landing opens burnt red under the drawn Andes, drains as the reader
 * works through the sections, and closes cobalt at the apply form. Two poles
 * and a drain, deliberately: the page is black and white type sits directly on
 * this, so a palette that kept inventing new colours would be a contrast
 * problem rather than a mood.
 */
export const HERO_PALETTES: readonly LiquidPalette[] = [
  EMBER,
  EMBER,
  DUSK,
  COBALT,
  COBALT,
] as const;

function mixTriple(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  t: number,
): [number, number, number] {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ];
}

/**
 * The palette at a point down the page, 0 at the top and 1 at the foot.
 *
 * Eased within each segment rather than linearly: a constant-rate crossfade
 * announces exactly where the two palettes were pinned, and the whole point is
 * that the reader should not be able to name the moment red became blue.
 */
export function paletteAt(progress: number): LiquidPalette {
  const clamped = Math.min(1, Math.max(0, progress));
  const span = clamped * (HERO_PALETTES.length - 1);
  const index = Math.min(HERO_PALETTES.length - 2, Math.floor(span));
  const t = span - index;
  const eased = t * t * (3 - 2 * t);
  const from = HERO_PALETTES[index] as LiquidPalette;
  const to = HERO_PALETTES[index + 1] as LiquidPalette;
  return {
    rim: mixTriple(from.rim, to.rim, eased),
    low: mixTriple(from.low, to.low, eased),
    edge: mixTriple(from.edge, to.edge, eased),
    bulk: mixTriple(from.bulk, to.bulk, eased),
  };
}

/** Per-frame easing toward the scroll's palette, so a flung scrollbar still pours. */
export const PALETTE_EASE = 0.08;

/**
 * Where down the page the reader is, as a 0..1 position in the palette.
 *
 * Guarded against the degenerate document: during hydration, and on any page
 * shorter than the window, the scrollable height is zero and the naive ratio is
 * a division by zero that reaches the shader as NaN — which in GLSL is not an
 * error, just a frame that renders black and never recovers.
 */
export function scrollPalettePosition(
  scrollY: number,
  documentHeight: number,
  viewportHeight: number,
): number {
  const scrollable = documentHeight - viewportHeight;
  if (scrollable <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, scrollY / scrollable));
}
