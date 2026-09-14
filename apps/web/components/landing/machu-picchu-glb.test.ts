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
  // The shipped mesh is Draco-compressed now: ~35 MB of raw attributes down to
  // about 4 MB, which is what lets the grid sample every ~54 m rather than
  // every ~160 m. The decoder is vendored under public/draco/, so the loader
  // stays safe without reaching for a CDN.
  expect(manifest.extensionsRequired).toEqual(["KHR_draco_mesh_compression"]);
  // And it carries its Sentinel-2 drape baked in, as a plain JPEG on purpose:
  // WebP and Basis both need loader extensions isHeroGltfLoaderSafe refuses.
  expect(manifest.imageMimeTypes).toEqual(["image/jpeg"]);
  expect(manifest.materialNames).toContain("sacred-valley-surface");
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
