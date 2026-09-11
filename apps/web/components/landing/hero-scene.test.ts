import { expect, test } from "bun:test";

import {
  HERO_SCENE_MODEL_URL,
  HERO_SCENE_ROOT_ID,
  HERO_SCENE_THEME,
} from "./hero-scene";

test("exports the locked Machu Picchu mount contract", () => {
  expect(HERO_SCENE_ROOT_ID).toBe("hero-scene");
  expect(HERO_SCENE_THEME).toBe("machu-picchu");
  expect(HERO_SCENE_MODEL_URL).toBe("/models/machu-picchu.glb");
});
