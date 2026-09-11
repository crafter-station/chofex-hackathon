import { expect, test } from "bun:test";

import { formatSoles, prizeAmountsPen } from "./content";
import { formatPrizeAmount } from "./prize-counter";

test("formats the accessible prize amount without counting up", () => {
  const numbered = formatPrizeAmount(6_700, "number");
  expect(numbered).toContain("6");
  expect(numbered).toContain("700");
  expect(formatPrizeAmount(1_675, "soles")).toBe(formatSoles(1_675));
});

test("formats first and second place as the final amounts, not zero", () => {
  expect(formatPrizeAmount(prizeAmountsPen.first, "number")).toBe(
    formatPrizeAmount(6_700, "number"),
  );
  expect(formatPrizeAmount(prizeAmountsPen.second, "soles")).toBe(
    formatSoles(1_675),
  );
  expect(formatPrizeAmount(prizeAmountsPen.first, "number")).not.toBe(
    formatPrizeAmount(0, "number"),
  );
  expect(formatPrizeAmount(prizeAmountsPen.second, "soles")).not.toBe(
    formatPrizeAmount(0, "soles"),
  );
});
