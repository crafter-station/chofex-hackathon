import { expect, test } from "bun:test";

import { HERO_SCENE_MODEL_URL } from "./hero-scene";
import { HERO_MODEL_PRELOAD } from "./machu-picchu-preload";

test("preloads the public Machu Picchu GLB as a fetch", () => {
  expect(HERO_MODEL_PRELOAD.href).toBe(HERO_SCENE_MODEL_URL);
  expect(HERO_MODEL_PRELOAD.href).toBe("/models/machu-picchu.glb");
  expect(HERO_MODEL_PRELOAD.as).toBe("fetch");
  expect(HERO_MODEL_PRELOAD.crossOrigin).toBe("anonymous");
});
