import { describe, expect, test } from "bun:test";

import {
  advancePointer,
  heroFadeAt,
  magnetTarget,
  pointerSpeed,
  RESTING_POINTER,
  springDistort,
} from "@/components/landing-v2/magnet";

describe("advancePointer", () => {
  test("trails the pointer instead of tracking it", () => {
    const moved = advancePointer({ ...RESTING_POINTER, targetX: 1 });

    // The lens is supposed to lag: landing on the cursor on the first frame is
    // what makes a glass sphere read as a cursor graphic.
    expect(moved.x).toBeGreaterThan(0.5);
    expect(moved.x).toBeLessThan(0.6);
  });

  test("settles to zero velocity once the pointer stops", () => {
    let pointer = { ...RESTING_POINTER, targetX: 0.9 };
    for (let frame = 0; frame < 400; frame += 1) {
      pointer = advancePointer(pointer);
    }

    expect(pointer.x).toBeCloseTo(0.9, 4);
    expect(pointerSpeed(pointer)).toBeLessThan(1e-4);
  });
});

describe("magnetTarget", () => {
  test("a brisk gesture saturates the warp", () => {
    expect(magnetTarget(0.05, false)).toBe(1);
  });

  test("a resting cursor asks for nothing", () => {
    expect(magnetTarget(0, false)).toBe(0);
  });

  test("reduced motion pins it shut however fast the cursor moves", () => {
    expect(magnetTarget(0.4, true)).toBe(0);
  });
});

describe("springDistort", () => {
  test("grabs faster than it lets go", () => {
    const attack = springDistort(0, 1);
    const release = 1 - springDistort(1, 0);

    expect(attack).toBeGreaterThan(release);
  });

  test("reaches a true zero, not an asymptote", () => {
    let distort = 1;
    for (let frame = 0; frame < 400; frame += 1) {
      distort = springDistort(distort, 0);
    }

    // The shader early-outs on exactly zero; a residue would both warp the
    // "static" field forever and pay for the warp on every pixel.
    expect(distort).toBe(0);
  });
});

describe("heroFadeAt", () => {
  test("is fully present at the top", () => {
    expect(heroFadeAt(0, 900)).toBe(1);
  });

  test("has cleared out within the first third of a viewport", () => {
    expect(heroFadeAt(300, 900)).toBeCloseTo(0, 5);
  });

  test("survives a zero-height viewport during hydration", () => {
    expect(heroFadeAt(120, 0)).toBe(1);
  });
});
