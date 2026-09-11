import { expect, test } from "bun:test";

import { isSoftwareGpu, resolveWorldPresentation } from "./world-capability";

test("falls back when WebGL is missing", () => {
  const presentation = resolveWorldPresentation({
    hasWebGL: false,
    prefersReducedMotion: false,
  });
  expect(presentation).toEqual({ mode: "fallback", reason: "no-webgl" });
});

test("falls back for reduced motion even when WebGL is available", () => {
  const presentation = resolveWorldPresentation({
    hasWebGL: true,
    prefersReducedMotion: true,
  });
  expect(presentation).toEqual({
    mode: "fallback",
    reason: "reduced-motion",
  });
});

test("falls back on very low memory devices", () => {
  const presentation = resolveWorldPresentation({
    hasWebGL: true,
    prefersReducedMotion: false,
    deviceMemory: 2,
  });
  expect(presentation).toEqual({ mode: "fallback", reason: "weak-device" });
});

test("uses a low-quality live scene on software gpus", () => {
  expect(isSoftwareGpu("Google SwiftShader")).toBe(true);
  const presentation = resolveWorldPresentation({
    hasWebGL: true,
    prefersReducedMotion: false,
    gpuRenderer: "llvmpipe (LLVM 15.0.0, 256 bits)",
  });
  expect(presentation).toEqual({ mode: "webgl", quality: "low" });
});

test("uses a high-quality live scene when auto and the device is capable", () => {
  const presentation = resolveWorldPresentation({
    hasWebGL: true,
    prefersReducedMotion: false,
    deviceMemory: 8,
    hardwareConcurrency: 8,
    quality: "auto",
  });
  expect(presentation).toEqual({ mode: "webgl", quality: "high" });
});

test("honors an explicit quality pin", () => {
  const presentation = resolveWorldPresentation({
    hasWebGL: true,
    prefersReducedMotion: false,
    deviceMemory: 8,
    hardwareConcurrency: 8,
    quality: "low",
  });
  expect(presentation).toEqual({ mode: "webgl", quality: "low" });
});
