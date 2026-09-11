import { expect, test } from "bun:test";

import {
  HERO_SCENE_MODEL_URL,
  HERO_SCENE_ROOT_ID,
  HERO_SCENE_THEME,
} from "./hero-scene";

test("exports the Sacred Valley mount contract", () => {
  expect(HERO_SCENE_ROOT_ID).toBe("hero-scene");
  expect(HERO_SCENE_THEME).toBe("sacred-valley");
  expect(HERO_SCENE_MODEL_URL).toBe("/models/sacred-valley.glb");
});
