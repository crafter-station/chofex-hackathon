import { expect, test } from "bun:test";

import {
  isCitadelPresented,
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

test("treats only the presented citadel GLB as a ready world", () => {
  expect(isWorldReadyToReveal("pending")).toBe(false);
  expect(isWorldReadyToReveal("canvas")).toBe(false);
  expect(isWorldReadyToReveal("procedural")).toBe(false);
  expect(isWorldReadyToReveal("uncentered")).toBe(false);
  expect(isWorldReadyToReveal("citadel")).toBe(true);
});

test("waits for the citadel to be centered and drawn before reveal", () => {
  expect(
    isCitadelPresented({
      glbLoaded: true,
      centered: false,
      presentedFrames: 4,
      heroSubject: "citadel",
    }),
  ).toBe(false);
  expect(
    isCitadelPresented({
      glbLoaded: true,
      centered: true,
      presentedFrames: 1,
      heroSubject: "citadel",
    }),
  ).toBe(false);
  expect(
    isCitadelPresented({
      glbLoaded: true,
      centered: true,
      presentedFrames: 2,
      heroSubject: null,
    }),
  ).toBe(false);
  expect(
    isCitadelPresented({
      glbLoaded: true,
      centered: true,
      presentedFrames: 2,
      heroSubject: "citadel",
    }),
  ).toBe(true);
});
