import { expect, test } from "bun:test";

import { formatSoles } from "./content";
import {
  formatPrizeAmount,
  isRectInViewport,
  shouldStartPrizeCounter,
} from "./prize-counter";

test("formats the accessible prize amount without counting up", () => {
  const numbered = formatPrizeAmount(6_700, "number");
  expect(numbered).toContain("6");
  expect(numbered).toContain("700");
  expect(formatPrizeAmount(1_675, "soles")).toBe(formatSoles(1_675));
});

test("treats a node already on screen as in view", () => {
  expect(
    isRectInViewport(
      { top: 80, right: 400, bottom: 160, left: 24 },
      { width: 1280, height: 720 },
    ),
  ).toBe(true);
  expect(
    isRectInViewport(
      { top: 800, right: 400, bottom: 880, left: 24 },
      { width: 1280, height: 720 },
    ),
  ).toBe(false);
});

test("shows the final amount immediately when motion is reduced", () => {
  expect(
    shouldStartPrizeCounter({
      reducedMotion: true,
      intersecting: false,
      alreadyInViewport: false,
    }),
  ).toBe("final");
});

test("starts as soon as the node is intersecting or already in view", () => {
  expect(
    shouldStartPrizeCounter({
      reducedMotion: false,
      intersecting: true,
      alreadyInViewport: false,
    }),
  ).toBe("play");
  expect(
    shouldStartPrizeCounter({
      reducedMotion: false,
      intersecting: false,
      alreadyInViewport: true,
    }),
  ).toBe("play");
  expect(
    shouldStartPrizeCounter({
      reducedMotion: false,
      intersecting: false,
      alreadyInViewport: false,
    }),
  ).toBe("wait");
});
