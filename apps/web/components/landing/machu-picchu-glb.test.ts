import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  heroSubjectFromLoadedGltf,
  isHeroGltfTerrain,
  isHeroGltfLoaderSafe,
  parseGlbManifest,
  readHeroSubject,
} from "./machu-picchu-glb";

const GLB_PATH = join(import.meta.dir, "../../public/models/sacred-valley.glb");

test("ships a loader-safe Sacred Valley terrain GLB", () => {
  const manifest = parseGlbManifest(new Uint8Array(readFileSync(GLB_PATH)));
  expect(isHeroGltfTerrain(manifest)).toBe(true);
  expect(isHeroGltfLoaderSafe(manifest)).toBe(true);
  expect(manifest.heroSubject).toBe("terrain");
  expect(manifest.title).toBe("Sacred Valley of Cusco Terrain");
  expect(manifest.extensionsRequired).toEqual([]);
  expect(manifest.imageMimeTypes).toEqual([]);
  expect(manifest.materialNames).toContain("sacred-valley-earth");
});

test("rejects an unmarked scene as Sacred Valley terrain", () => {
  expect(
    isHeroGltfTerrain({
      title: "Ollantaytambo Archaeological Site",
      heroSubject: null,
      extensionsRequired: ["EXT_texture_webp", "EXT_meshopt_compression"],
      imageMimeTypes: ["image/webp"],
      materialNames: ["TerrainNodeMaterial"],
    }),
  ).toBe(false);
  expect(
    isHeroGltfLoaderSafe({
      title: "Ollantaytambo Archaeological Site",
      heroSubject: null,
      extensionsRequired: ["EXT_texture_webp"],
      imageMimeTypes: ["image/webp"],
      materialNames: ["TerrainNodeMaterial"],
    }),
  ).toBe(false);
});

test("reads the terrain subject from GLB extras", () => {
  expect(readHeroSubject({ heroSubject: "terrain" })).toBe("terrain");
  expect(readHeroSubject({ heroSubject: "citadel" }, undefined)).toBe(null);
  expect(
    heroSubjectFromLoadedGltf({
      asset: { extras: { heroSubject: "terrain" } },
      scene: { userData: {}, children: [] },
    }),
  ).toBe("terrain");
});
