import { expect, test } from "bun:test";

import {
  isDocumentVisible,
  shouldRunWorldFrameLoop,
  worldFrameLoop,
} from "./world-loop";

test("treats an unknown visibility state as visible", () => {
  expect(isDocumentVisible(undefined)).toBe(true);
  expect(isDocumentVisible("visible")).toBe(true);
  expect(isDocumentVisible("hidden")).toBe(false);
});

test("pauses the world loop off-screen or when the tab is hidden", () => {
  expect(
    shouldRunWorldFrameLoop({
      intersecting: false,
      documentVisible: true,
    }),
  ).toBe(false);
  expect(
    shouldRunWorldFrameLoop({
      intersecting: true,
      documentVisible: false,
    }),
  ).toBe(false);
});

test("runs the world loop only while on-screen, visible, and motion is allowed", () => {
  expect(
    shouldRunWorldFrameLoop({
      intersecting: true,
      documentVisible: true,
    }),
  ).toBe(true);
  expect(
    shouldRunWorldFrameLoop({
      intersecting: true,
      documentVisible: true,
      reducedMotion: true,
    }),
  ).toBe(false);
  expect(worldFrameLoop(true)).toBe("always");
  expect(worldFrameLoop(false)).toBe("never");
});
