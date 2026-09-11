import { expect, test } from "bun:test";

import { HERO_SCENE_MODEL_URL } from "./hero-scene";
import {
  CITADEL_OVERLOOK,
  chapterFromProgress,
  chapterStartProgress,
  MACHU_MODEL_SCALE,
  MACHU_PICCHU_GLB,
  MACHU_SOURCE_BBOX,
  sampleCameraPath,
  scaledSourceSize,
  WORLD_CHAPTERS,
  WORLD_FIGURES,
  worldScrollTop,
} from "./machu-picchu-geometry";

test("points the hero model at the public glb path", () => {
  expect(MACHU_PICCHU_GLB).toBe(HERO_SCENE_MODEL_URL);
  expect(HERO_SCENE_MODEL_URL).toBe("/models/sacred-valley.glb");
  expect(MACHU_MODEL_SCALE).toBeGreaterThan(0);
  expect(MACHU_SOURCE_BBOX.max[1]).toBeGreaterThan(MACHU_SOURCE_BBOX.min[1]);
});

test("scales the source bbox into a navigable hero volume", () => {
  const size = scaledSourceSize();
  expect(size.width).toBeGreaterThan(24);
  expect(size.width).toBeLessThan(120);
  expect(size.height).toBeGreaterThan(20);
  expect(size.height).toBeLessThan(50);
});

test("maps scroll progress onto hero, valley, and scan chapters", () => {
  expect(chapterFromProgress(0)).toBe("hero");
  expect(chapterFromProgress(0.4)).toBe("valley");
  expect(chapterFromProgress(0.8)).toBe("scan");
});

test("exposes labeled chapter stops for the world rail", () => {
  expect(WORLD_CHAPTERS.map((chapter) => chapter.id)).toEqual([
    "hero",
    "valley",
    "scan",
  ]);
  expect(chapterStartProgress("hero")).toBe(0);
  expect(chapterStartProgress("valley")).toBe(0.34);
  expect(chapterStartProgress("scan")).toBe(0.64);
  expect(
    worldScrollTop({
      sectionOffsetTop: 100,
      sectionHeight: 4000,
      viewportHeight: 1000,
      progress: 0.34,
    }),
  ).toBe(1120);
});

test("reloads onto the Cumbre citadel overlook", () => {
  expect(CITADEL_OVERLOOK.chapter).toBe("hero");
  expect(CITADEL_OVERLOOK.progress).toBe(0);
  expect(chapterFromProgress(CITADEL_OVERLOOK.progress)).toBe("hero");
  expect(chapterStartProgress("hero")).toBe(CITADEL_OVERLOOK.progress);
  expect(WORLD_CHAPTERS[0]).toEqual({
    id: "hero",
    label: "Cumbre",
    progress: 0,
  });

  const overlook = sampleCameraPath(CITADEL_OVERLOOK.progress);
  const valley = sampleCameraPath(0.5);
  expect(overlook.position[1]).toBeGreaterThan(valley.position[1]);
  expect(overlook.position[2]).toBeGreaterThan(valley.position[2]);
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
  expect(WORLD_FIGURES.some((figure) => figure.label === "QUISPE")).toBe(false);
});
