import { expect, test } from "bun:test";

import {
  clampLookOffset,
  isHorizontalLookGesture,
  isVerticalScrollGesture,
  LOOK_LIMITS,
  lookExploreScale,
  lookFromPointerDelta,
  lookSensitivityForPointer,
  REST_LOOK,
} from "./machu-picchu-look";

test("clamps look orbit so the citadel stays framed", () => {
  expect(clampLookOffset({ yaw: 4, pitch: -3 })).toEqual({
    yaw: LOOK_LIMITS.yaw,
    pitch: -LOOK_LIMITS.pitch,
  });
});

test("applies pointer deltas with pointer-type sensitivity", () => {
  const next = lookFromPointerDelta(
    REST_LOOK,
    20,
    -10,
    lookSensitivityForPointer("mouse"),
  );
  expect(next.yaw).toBeLessThan(0);
  expect(next.pitch).toBeLessThan(0);
  expect(lookSensitivityForPointer("touch")).toBeLessThan(
    lookSensitivityForPointer("mouse"),
  );
});

test("treats horizontal drags as look and vertical swipes as scroll", () => {
  expect(isHorizontalLookGesture(24, 4)).toBe(true);
  expect(isHorizontalLookGesture(4, 24)).toBe(false);
  expect(isVerticalScrollGesture(4, 24)).toBe(true);
  expect(isVerticalScrollGesture(24, 4)).toBe(false);
});

test("keeps look orbit on the hero chapter and fades it later", () => {
  expect(lookExploreScale(0)).toBe(1);
  expect(lookExploreScale(0.12)).toBeGreaterThan(0.4);
  expect(lookExploreScale(0.4)).toBe(0);
});
