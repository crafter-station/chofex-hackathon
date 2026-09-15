import { describe, expect, test } from "bun:test";
import * as THREE from "three";

import { applyContourMaterial } from "@/components/landing/sacred-valley-contour-material";

describe("applyContourMaterial", () => {
  test("replaces the satellite drape with an unlit contour material", () => {
    const map = new THREE.Texture();
    const source = new THREE.MeshStandardMaterial({ map, color: 0xff0000 });

    const next = applyContourMaterial(source);

    expect(next).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect((next as THREE.MeshBasicMaterial).map).toBeNull();
    expect((next as THREE.MeshBasicMaterial).color.getHex()).toBe(0x000000);
    expect(next.customProgramCacheKey()).toBe("landing-contour-isolines");
  });

  test("is safe to call more than once", () => {
    const source = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const first = applyContourMaterial(source);
    const second = applyContourMaterial(first);
    expect(second).toBeInstanceOf(THREE.MeshBasicMaterial);
    expect(second.customProgramCacheKey()).toBe("landing-contour-isolines");
  });
});
