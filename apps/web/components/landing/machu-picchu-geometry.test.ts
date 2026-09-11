import { expect, test } from "bun:test";

import { HERO_SCENE_MODEL_URL } from "./hero-scene";
import {
  chapterFromProgress,
  MACHU_MODEL_SCALE,
  MACHU_PICCHU_GLB,
  MACHU_SOURCE_BBOX,
  sampleCameraPath,
  scaledSourceSize,
  WORLD_FIGURES,
} from "./machu-picchu-geometry";

test("points the hero model at the public glb path", () => {
  expect(MACHU_PICCHU_GLB).toBe(HERO_SCENE_MODEL_URL);
  expect(HERO_SCENE_MODEL_URL).toBe("/models/machu-picchu.glb");
  expect(MACHU_MODEL_SCALE).toBeGreaterThan(0);
  expect(MACHU_SOURCE_BBOX.max[1]).toBeGreaterThan(MACHU_SOURCE_BBOX.min[1]);
});

test("scales the source bbox into a navigable hero volume", () => {
  const size = scaledSourceSize();
  expect(size.width).toBeGreaterThan(100);
  expect(size.width).toBeLessThan(200);
  expect(size.height).toBeGreaterThan(20);
  expect(size.height).toBeLessThan(80);
});

test("maps scroll progress onto hero, valley, and scan chapters", () => {
  expect(chapterFromProgress(0)).toBe("hero");
  expect(chapterFromProgress(0.4)).toBe("valley");
  expect(chapterFromProgress(0.8)).toBe("scan");
});

test("keeps the camera path descending into the valley", () => {
  const hero = sampleCameraPath(0);
  const valley = sampleCameraPath(0.5);
  const scan = sampleCameraPath(0.9);
  expect(hero.position[1]).toBeLessThan(24);
  expect(valley.position[1]).toBeLessThan(hero.position[1]);
  expect(scan.position[2]).toBeLessThan(hero.position[2]);
});

test("places figures for the valley and scan chapters", () => {
  expect(WORLD_FIGURES.some((figure) => figure.kind === "judge")).toBe(true);
  expect(WORLD_FIGURES.length).toBeGreaterThan(3);
});
