import { describe, expect, test } from "bun:test";

import {
  advancePan,
  dragPan,
  PAN_LIMIT,
  panToPalette,
  RESTING_PAN,
} from "@/components/landing-v2/pan";

describe("dragPan", () => {
  test("moves with the hand", () => {
    expect(dragPan(RESTING_PAN, 0.2).offset).toBeCloseTo(0.2, 6);
  });

  test("stops at the end of the range instead of running off into sky", () => {
    const pushed = dragPan({ offset: PAN_LIMIT, velocity: 0 }, 0.5);

    expect(pushed.offset).toBe(PAN_LIMIT);
    // And it must not bank a throw there, or letting go rebounds.
    expect(pushed.velocity).toBe(0);
  });
});

describe("advancePan", () => {
  test("holds the throw while the pointer is down", () => {
    const held = { offset: 0.4, velocity: 0.03 };

    expect(advancePan(held, true)).toEqual(held);
  });

  test("coasts to a true stop after a flick", () => {
    let pan = { offset: 0, velocity: 0.04 };
    for (let frame = 0; frame < 600; frame += 1) {
      pan = advancePan(pan, false);
    }

    expect(pan.velocity).toBe(0);
    expect(pan.offset).toBeGreaterThan(0.04);
  });
});

describe("panToPalette", () => {
  test("opens in the middle and reaches both poles at the limits", () => {
    expect(panToPalette(0)).toBeCloseTo(0.5, 6);
    // The ends of the drag are the ends of the palette: a reader who pushes
    // the range all the way one way gets the colour all the way with it.
    expect(panToPalette(-PAN_LIMIT)).toBe(0);
    expect(panToPalette(PAN_LIMIT)).toBe(1);
  });

  test("never leaves 0..1, whatever it is handed", () => {
    expect(panToPalette(-999)).toBe(0);
    expect(panToPalette(999)).toBe(1);
  });
});
