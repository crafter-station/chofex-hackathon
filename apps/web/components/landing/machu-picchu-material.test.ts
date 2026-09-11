import { describe, expect, test } from "bun:test";
import * as THREE from "three";

import { polishStoneMaterial } from "@/components/landing/machu-picchu-model";

describe("polishStoneMaterial", () => {
  test("upgrades a standard GLB material without copying missing physical fields", () => {
    const source = new THREE.MeshStandardMaterial({ color: "#68725e" });

    expect(() => polishStoneMaterial(source, "high")).not.toThrow();

    const polished = polishStoneMaterial(source, "high");
    expect(polished).toBeInstanceOf(THREE.MeshPhysicalMaterial);
    expect((polished as THREE.MeshPhysicalMaterial).color.getHexString()).not.toBe(
      "68725e",
    );
  });
});
