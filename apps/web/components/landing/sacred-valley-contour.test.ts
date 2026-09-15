import { expect, test } from "bun:test";

import {
  CONTOUR_INTERVAL,
  contourBand,
  isContourLine,
} from "./sacred-valley-contour";

test("marks isolines at every contour interval", () => {
  expect(isContourLine(0)).toBe(false);
  expect(isContourLine(CONTOUR_INTERVAL * 0.5)).toBe(true);
  expect(isContourLine(CONTOUR_INTERVAL * 1.5)).toBe(true);
  expect(isContourLine(CONTOUR_INTERVAL * 2.5)).toBe(true);
});

test("keeps the slope between isolines empty", () => {
  expect(isContourLine(CONTOUR_INTERVAL * 0.12)).toBe(false);
  expect(isContourLine(CONTOUR_INTERVAL * 0.88)).toBe(false);
  expect(contourBand(CONTOUR_INTERVAL * 0.25, CONTOUR_INTERVAL)).toBeGreaterThan(
    0.2,
  );
});
