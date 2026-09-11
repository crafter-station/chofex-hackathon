import { expect, test } from "bun:test";

import {
  isPaintedFallbackVisible,
  paintedFallbackClassName,
} from "./world-reveal";

test("keeps the painted fallback visible until the world reports ready", () => {
  expect(isPaintedFallbackVisible(false)).toBe(true);
  expect(isPaintedFallbackVisible(true)).toBe(false);
});

test("fades the painted fallback only after the world is ready", () => {
  expect(paintedFallbackClassName(false)).toBe("landing-world-fallback");
  expect(paintedFallbackClassName(true)).toBe(
    "landing-world-fallback landing-world-fallback--ready",
  );
});
