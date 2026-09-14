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
} from "./sacred-valley-look";

test("clamps look orbit so the valley stays framed", () => {
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

test("allows look while parked on a site and shuts it off in transit", () => {
  expect(lookExploreScale(1)).toBe(1);
  expect(lookExploreScale(0.5)).toBe(0.5);
  expect(lookExploreScale(0)).toBe(0);
  // Out-of-range focus must not hand the camera an unbounded orbit.
  expect(lookExploreScale(1.4)).toBe(1);
  expect(lookExploreScale(-0.3)).toBe(0);
});
