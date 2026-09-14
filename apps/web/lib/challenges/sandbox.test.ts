import { describe, expect, test } from "bun:test";

import { HttpError } from "../registration/http";
import { runShippingSolution } from "./sandbox";

const shipment = {
  distanceKm: 10,
  weightKg: 3,
  hour: 14,
  fragile: false,
  express: false,
};

describe("shipping solution sandbox", () => {
  test("runs a named calculateShipping function", () => {
    const results = runShippingSolution(
      "function calculateShipping(input) { return input.distanceKm + input.weightKg; }",
      [shipment],
    );
    expect(results).toEqual([13]);
  });

  test("rejects missing functions and host access", () => {
    expect(() => runShippingSolution("const x = 1;", [shipment])).toThrow(
      HttpError,
    );
    expect(() =>
      runShippingSolution(
        "function calculateShipping() { return process.exit(0); }",
        [shipment],
      ),
    ).toThrow(HttpError);
  });
});
