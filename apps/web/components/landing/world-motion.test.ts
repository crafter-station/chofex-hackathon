import { expect, test } from "bun:test";

import { shouldPlaySceneEffects, worldMotionScale } from "./world-motion";

test("zeros camera drift and effects when reduced motion is preferred", () => {
  expect(worldMotionScale(true)).toBe(0);
  expect(shouldPlaySceneEffects(true)).toBe(false);
});

test("keeps live scene motion when reduced motion is off", () => {
  expect(worldMotionScale(false)).toBe(1);
  expect(shouldPlaySceneEffects(false)).toBe(true);
});
