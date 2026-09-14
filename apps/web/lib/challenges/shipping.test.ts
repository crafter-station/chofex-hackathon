import { describe, expect, test } from "bun:test";
import { scoreFromPredictions } from "@chofex/challenges-contract";

import {
  calculateShippingPrice,
  hiddenShipmentsForSeed,
  oraclePriceForSeed,
  type ShippingParams,
  shippingParamsFromSeed,
} from "./shipping";

const sourceFromParams = (params: ShippingParams): string => `
function calculateShipping(input) {
  let price = ${params.basePrice};
  price += Math.ceil(input.distanceKm / ${params.distanceStepKm}) * ${params.distanceUnitPrice};
  price += Math.ceil(input.weightKg / ${params.weightStepKg}) * ${params.weightUnitPrice};
  if (input.hour >= ${params.peakStart} && input.hour <= ${params.peakEnd}) {
    price *= ${params.peakMultiplier};
  }
  if (input.fragile) {
    price += ${params.fragileSurcharge};
  }
  if (input.express) {
    price += ${params.expressSurcharge};
  }
  if (input.fragile && input.express) {
    price += ${params.comboSurcharge};
  }
  return Math.ceil(price / ${params.roundTo}) * ${params.roundTo};
}
`;

describe("personalized shipping oracle", () => {
  test("is deterministic per seed and varies across participants", () => {
    const first = shippingParamsFromSeed("participant-a");
    const again = shippingParamsFromSeed("participant-a");
    const other = shippingParamsFromSeed("participant-b");
    expect(first).toEqual(again);
    expect(JSON.stringify(first)).not.toBe(JSON.stringify(other));
  });

  test("keeps the same rule structure for every seed", () => {
    for (const seed of ["alpha", "beta", "gamma", "delta"]) {
      const params = shippingParamsFromSeed(seed);
      expect(params.basePrice).toBeGreaterThan(0);
      expect(params.distanceStepKm).toBeGreaterThan(0);
      expect(params.weightStepKg).toBeGreaterThan(0);
      expect(params.peakEnd).toBeGreaterThanOrEqual(params.peakStart);
      expect(params.comboSurcharge).toBeGreaterThan(0);
      expect(params.roundTo).toBeGreaterThan(0);
    }
  });

  test("scores a perfect replica at 100% and hides the fragile+express interaction", () => {
    const seed = "difficulty-curve";
    const params = shippingParamsFromSeed(seed);
    const shipments = hiddenShipmentsForSeed(seed, 1000);
    const expected = shipments.map((input) =>
      calculateShippingPrice(params, input),
    );
    const perfect = expected;
    const withoutInteraction = shipments.map((input) =>
      calculateShippingPrice({ ...params, comboSurcharge: 0 }, input),
    );

    const perfectScore = scoreFromPredictions(expected, perfect, 12, 5);
    const interactionScore = scoreFromPredictions(
      expected,
      withoutInteraction,
      12,
      5,
    );
    const comboCases = shipments.filter(
      (input) => input.fragile && input.express,
    ).length;

    expect(perfectScore.accuracy).toBe(1);
    expect(comboCases).toBeGreaterThan(20);
    expect(interactionScore.accuracy).toBeGreaterThan(0.8);
    expect(interactionScore.accuracy).toBeLessThan(1);
  });

  test("includes boolean combinations and peak-hour boundaries in the hidden set", () => {
    const seed = "coverage";
    const params = shippingParamsFromSeed(seed);
    const shipments = hiddenShipmentsForSeed(seed, 1000);
    expect(shipments.some((item) => item.fragile && item.express)).toBe(true);
    expect(shipments.some((item) => !item.fragile && !item.express)).toBe(true);
    expect(shipments.some((item) => item.hour === params.peakStart)).toBe(true);
    expect(
      shipments.some((item) => item.hour === Math.max(0, params.peakStart - 1)),
    ).toBe(true);
    const sample = shipments[0];
    expect(sample).toBeDefined();
    if (!sample) throw new Error("hidden set was empty");
    expect(oraclePriceForSeed(seed, sample)).toEqual(
      calculateShippingPrice(params, sample),
    );
    expect(sourceFromParams(params)).toContain("calculateShipping");
  });
});
