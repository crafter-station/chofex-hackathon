import { expect, test } from "bun:test";

import {
  formatSoles,
  judges,
  prizeAmountsPen,
  prizeAmountsUsd,
  usdToPenRate,
} from "./content";

test("converts published USD prizes to soles at the documented rate", () => {
  expect(usdToPenRate).toBe(3.35);
  expect(prizeAmountsUsd.first).toBe(2_000);
  expect(prizeAmountsUsd.second).toBe(500);
  expect(prizeAmountsPen.first).toBe(6_700);
  expect(prizeAmountsPen.second).toBe(1_675);
  expect(prizeAmountsPen.travelPool).toBe(1_005);
});

test("formats soles with the Peru locale", () => {
  expect(formatSoles(6_700)).toContain("6");
  expect(formatSoles(6_700)).toContain("700");
});

test("publishes judge profiles for the valley chapter", () => {
  expect(judges.length).toBeGreaterThanOrEqual(1);
  expect(judges[0]?.id).toBe("j-01");
  expect(judges[0]?.callsign).toBe("QUISPE");
});
