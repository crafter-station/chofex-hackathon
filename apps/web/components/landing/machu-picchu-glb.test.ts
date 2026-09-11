import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  heroSubjectFromLoadedGltf,
  isHeroGltfCitadel,
  isHeroGltfLoaderSafe,
  parseGlbManifest,
  readHeroSubject,
} from "./machu-picchu-glb";

const GLB_PATH = join(import.meta.dir, "../../public/models/machu-picchu.glb");

test("ships a loader-safe Machu Picchu citadel GLB", () => {
  const manifest = parseGlbManifest(new Uint8Array(readFileSync(GLB_PATH)));
  expect(isHeroGltfCitadel(manifest)).toBe(true);
  expect(isHeroGltfLoaderSafe(manifest)).toBe(true);
  expect(manifest.heroSubject).toBe("citadel");
  expect(manifest.title).toBe("Machu Picchu Citadel");
  expect(manifest.extensionsRequired).toEqual([]);
  expect(manifest.imageMimeTypes).toEqual([]);
  expect(manifest.materialNames).toContain("citadel-stone");
});

test("rejects the valley DEM stand-in as a citadel", () => {
  expect(
    isHeroGltfCitadel({
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

test("reads the citadel subject from GLB extras", () => {
  expect(readHeroSubject({ heroSubject: "citadel" })).toBe("citadel");
  expect(readHeroSubject({ heroSubject: "terrain" }, undefined)).toBe(null);
  expect(
    heroSubjectFromLoadedGltf({
      asset: { extras: { heroSubject: "citadel" } },
      scene: { userData: {}, children: [] },
    }),
  ).toBe("citadel");
});
