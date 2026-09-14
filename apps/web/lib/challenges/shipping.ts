import type { Shipment } from "@chofex/challenges-contract";

import { mulberry32, uint32FromSeed } from "./seed";

export interface ShippingParams {
  readonly basePrice: number;
  readonly distanceStepKm: number;
  readonly distanceUnitPrice: number;
  readonly weightStepKg: number;
  readonly weightUnitPrice: number;
  readonly peakStart: number;
  readonly peakEnd: number;
  readonly peakMultiplier: number;
  readonly fragileSurcharge: number;
  readonly expressSurcharge: number;
  readonly comboSurcharge: number;
  readonly roundTo: number;
}

const pick = <T>(rng: () => number, options: ReadonlyArray<T>): T => {
  if (options.length === 0) throw new Error("Cannot pick from an empty list");
  const index = Math.min(
    options.length - 1,
    Math.floor(rng() * options.length),
  );
  const value = options[index];
  if (value === undefined) throw new Error("Cannot pick from an empty list");
  return value;
};

export const shippingParamsFromSeed = (seed: string): ShippingParams => {
  const rng = mulberry32(uint32FromSeed(seed));
  return {
    basePrice: pick(rng, [6, 8, 10]),
    distanceStepKm: pick(rng, [4, 5, 6, 7]),
    distanceUnitPrice: pick(rng, [2, 3, 4]),
    weightStepKg: pick(rng, [2, 3]),
    weightUnitPrice: pick(rng, [3, 4, 5]),
    peakStart: pick(rng, [16, 17, 18]),
    peakEnd: pick(rng, [20, 21, 22]),
    peakMultiplier: pick(rng, [1.2, 1.25, 1.3]),
    fragileSurcharge: pick(rng, [7, 9, 11]),
    expressSurcharge: pick(rng, [10, 12, 15]),
    comboSurcharge: pick(rng, [5, 7, 9]),
    roundTo: pick(rng, [5, 10]),
  };
};

export const calculateShippingPrice = (
  params: ShippingParams,
  input: Shipment,
): number => {
  let price = params.basePrice;
  price +=
    Math.ceil(input.distanceKm / params.distanceStepKm) *
    params.distanceUnitPrice;
  price +=
    Math.ceil(input.weightKg / params.weightStepKg) * params.weightUnitPrice;
  if (input.hour >= params.peakStart && input.hour <= params.peakEnd) {
    price *= params.peakMultiplier;
  }
  if (input.fragile) price += params.fragileSurcharge;
  if (input.express) price += params.expressSurcharge;
  if (input.fragile && input.express) price += params.comboSurcharge;
  return Math.ceil(price / params.roundTo) * params.roundTo;
};

const shuffleInPlace = <T>(items: Array<T>, rng: () => number): Array<T> => {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    const current = items[index];
    const other = items[swapIndex];
    if (current === undefined || other === undefined) continue;
    items[index] = other;
    items[swapIndex] = current;
  }
  return items;
};

export const hiddenShipmentsForSeed = (
  seed: string,
  count: number,
): Array<Shipment> => {
  const params = shippingParamsFromSeed(seed);
  const rng = mulberry32(uint32FromSeed(`${seed}:hidden`));
  const cases: Array<Shipment> = [];

  const distances = [
    Math.max(0.1, params.distanceStepKm - 0.5),
    params.distanceStepKm,
    params.distanceStepKm + 0.1,
    params.distanceStepKm * 2,
    1,
    120,
  ];
  const weights = [
    Math.max(0.1, params.weightStepKg - 0.5),
    params.weightStepKg,
    params.weightStepKg + 0.1,
    0.1,
    40,
  ];
  const hours = [
    Math.max(0, params.peakStart - 1),
    params.peakStart,
    params.peakEnd,
    Math.min(23, params.peakEnd + 1),
    12,
  ];

  for (const fragile of [false, true]) {
    for (const express of [false, true]) {
      for (const distanceKm of distances) {
        for (const weightKg of weights) {
          for (const hour of hours) {
            cases.push({
              distanceKm,
              weightKg,
              hour,
              fragile,
              express,
            });
          }
        }
      }
    }
  }

  while (cases.length < count) {
    cases.push({
      distanceKm: Number((0.1 + rng() * 400).toFixed(2)),
      weightKg: Number((0.1 + rng() * 80).toFixed(2)),
      hour: Math.floor(rng() * 24),
      fragile: rng() < 0.3,
      express: rng() < 0.3,
    });
  }

  return shuffleInPlace(cases, rng).slice(0, count);
};

export const oraclePriceForSeed = (seed: string, input: Shipment): number =>
  calculateShippingPrice(shippingParamsFromSeed(seed), input);
