import { describe, expect, test } from "bun:test";
import * as THREE from "three";

import { tuneTerrainMaterial } from "@/components/landing/sacred-valley-model";

describe("tuneTerrainMaterial", () => {
  test("applies the albedo lift once, however often it is called", () => {
    const source = new THREE.MeshStandardMaterial({ color: 0xffffff });

    // The effect this runs from fires twice under StrictMode and again on
    // every hot reload. A multiply here compounded into a blown-out white
    // citadel; setting the value makes repeat calls a no-op.
    tuneTerrainMaterial(source, "high", 4, null, 1.7);
    const once = source.color.clone();
    tuneTerrainMaterial(source, "high", 4, null, 1.7);
    tuneTerrainMaterial(source, "high", 4, null, 1.7);

    expect(source.color.r).toBeCloseTo(once.r, 6);
    expect(source.color.r).toBeCloseTo(1.7, 6);
  });

  test("keeps the baked drape sRGB and anisotropically filtered", () => {
    const map = new THREE.Texture();
    map.colorSpace = THREE.NoColorSpace;
    const source = new THREE.MeshStandardMaterial({ map, roughness: 0.2 });

    const tuned = tuneTerrainMaterial(source, "high", 16) as THREE.MeshStandardMaterial;

    expect(tuned.map?.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(tuned.map?.anisotropy).toBe(16);
    expect(tuned.metalness).toBe(0);
    // Terrain must not read as wet stone at a grazing sun angle.
    expect(tuned.roughness).toBeGreaterThanOrEqual(0.88);
  });

  test("clamps anisotropy on low-end GPUs", () => {
    const map = new THREE.Texture();
    const tuned = tuneTerrainMaterial(
      new THREE.MeshStandardMaterial({ map }),
      "low",
      16,
    ) as THREE.MeshStandardMaterial;

    expect(tuned.map?.anisotropy).toBe(4);
  });

  test("leaves a non-standard material alone", () => {
    const source = new THREE.MeshBasicMaterial();
    expect(tuneTerrainMaterial(source, "high", 16)).toBe(source);
  });
});
