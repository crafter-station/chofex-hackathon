import { expect, test } from "bun:test";

import { HERO_SCENE_MODEL_URL } from "./hero-scene";
import { HERO_MODEL_PRELOAD } from "./sacred-valley-preload";

test("preloads the same stamped URL the canvas will fetch", () => {
  // Preloading the unstamped path would warm the cache with a different URL
  // than the loader asks for, which costs a download and saves nothing.
  expect(HERO_MODEL_PRELOAD.href.startsWith(HERO_SCENE_MODEL_URL)).toBe(true);
  expect(HERO_MODEL_PRELOAD.href).toMatch(/\?v=[0-9a-f]{8,}$/);
  expect(HERO_MODEL_PRELOAD.as).toBe("fetch");
  expect(HERO_MODEL_PRELOAD.crossOrigin).toBe("anonymous");
});
