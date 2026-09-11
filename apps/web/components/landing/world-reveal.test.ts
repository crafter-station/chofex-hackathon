import { expect, test } from "bun:test";

import {
  isTerrainPresented,
  isPaintedFallbackVisible,
  isWorldReadyToReveal,
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

test("treats only the presented terrain GLB as a ready world", () => {
  expect(isWorldReadyToReveal("pending")).toBe(false);
  expect(isWorldReadyToReveal("canvas")).toBe(false);
  expect(isWorldReadyToReveal("procedural")).toBe(false);
  expect(isWorldReadyToReveal("uncentered")).toBe(false);
  expect(isWorldReadyToReveal("terrain")).toBe(true);
});

test("waits for the terrain to be centered and drawn before reveal", () => {
  expect(
    isTerrainPresented({
      glbLoaded: true,
      centered: false,
      presentedFrames: 4,
      heroSubject: "terrain",
    }),
  ).toBe(false);
  expect(
    isTerrainPresented({
      glbLoaded: true,
      centered: true,
      presentedFrames: 1,
      heroSubject: "terrain",
    }),
  ).toBe(false);
  expect(
    isTerrainPresented({
      glbLoaded: true,
      centered: true,
      presentedFrames: 2,
      heroSubject: null,
    }),
  ).toBe(false);
  expect(
    isTerrainPresented({
      glbLoaded: true,
      centered: true,
      presentedFrames: 2,
      heroSubject: "terrain",
    }),
  ).toBe(true);
});
