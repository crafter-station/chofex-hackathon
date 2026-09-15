import { describe, expect, test } from "bun:test";

import {
  hexToLinear,
  paletteAt,
  scrollPalettePosition,
} from "@/components/landing-v2/palette";

describe("hexToLinear", () => {
  test("maps a hex channel onto 0..1", () => {
    expect(hexToLinear("#ffffff")).toEqual([1, 1, 1]);
    expect(hexToLinear("#000000")).toEqual([0, 0, 0]);
  });
});

describe("paletteAt", () => {
  test("opens burnt red and closes cobalt", () => {
    const top = paletteAt(0);
    const foot = paletteAt(1);

    // bulk is what most of the liquid reads as, so it is the channel that
    // decides whether a frame is "the red one" or "the blue one".
    expect(top.bulk[0]).toBeGreaterThan(top.bulk[2]);
    expect(foot.bulk[2]).toBeGreaterThan(foot.bulk[0]);
  });

  test("drains through black rather than through violet", () => {
    // Crossfading red straight into cobalt walks the bulk through a third hue
    // the page does not have. Half way down, the liquid is nearly gone instead.
    const halfway = paletteAt(0.5);
    const top = paletteAt(0);

    const luma = (c: readonly [number, number, number]) =>
      0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    expect(luma(halfway.bulk)).toBeLessThan(luma(top.bulk) * 0.5);
  });

  test("clamps outside the page rather than extrapolating", () => {
    expect(paletteAt(-2).bulk).toEqual(paletteAt(0).bulk);
    expect(paletteAt(9).bulk).toEqual(paletteAt(1).bulk);
  });
});

describe("scrollPalettePosition", () => {
  test("maps the scrollable range onto 0..1", () => {
    expect(scrollPalettePosition(0, 3000, 1000)).toBe(0);
    expect(scrollPalettePosition(1000, 3000, 1000)).toBeCloseTo(0.5, 6);
    expect(scrollPalettePosition(2000, 3000, 1000)).toBe(1);
  });

  test("survives a document shorter than the window", () => {
    // Hydration, and any short page: the naive ratio divides by zero and the
    // NaN reaches the shader, where it is not an error — just a black frame
    // that never recovers.
    expect(scrollPalettePosition(0, 800, 1000)).toBe(0);
    expect(Number.isNaN(scrollPalettePosition(0, 1000, 1000))).toBe(false);
  });
});
