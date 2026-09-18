import { describe, expect, test } from "bun:test";

import {
  formatRankingVisibleAtInPeru,
  rankingCountdownParts,
} from "./ranking-countdown";

describe("ranking countdown", () => {
  test("splits the remaining time into days, hours, minutes, and seconds", () => {
    expect(rankingCountdownParts(93_784_000)).toEqual({
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
    });
  });

  test("stops at zero after the reveal time", () => {
    expect(rankingCountdownParts(-1)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  test("labels the configured reveal time in Peru", () => {
    expect(formatRankingVisibleAtInPeru("2026-09-19T02:00:00.000Z")).toBe(
      "18 de septiembre de 2026 · 21:00 (hora de Perú, UTC−5)",
    );
  });
});
