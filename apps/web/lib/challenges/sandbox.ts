import vm from "node:vm";

import type { Shipment } from "@chofex/challenges-contract";

import { HttpError } from "../registration/http";

const evaluationTimeoutMs = 1_500;

interface Sandbox {
  Math: Math;
  Number: NumberConstructor;
  Boolean: BooleanConstructor;
  String: StringConstructor;
  Array: ArrayConstructor;
  Object: ObjectConstructor;
  JSON: JSON;
  Infinity: number;
  NaN: number;
  undefined: undefined;
  isFinite: (value: unknown) => boolean;
  isNaN: (value: unknown) => boolean;
  parseInt: typeof Number.parseInt;
  parseFloat: typeof Number.parseFloat;
  module: { exports: unknown };
  exports: unknown;
  shipments: Array<Shipment>;
  results: unknown;
  __resolve: (exported: unknown) => unknown;
}

const resolveExportedFunction = (exported: unknown): unknown => {
  if (typeof exported === "function") return exported;
  if (
    exported &&
    typeof exported === "object" &&
    "calculateShipping" in exported &&
    typeof (exported as { calculateShipping: unknown }).calculateShipping ===
      "function"
  ) {
    return (exported as { calculateShipping: unknown }).calculateShipping;
  }
};

export const runShippingSolution = (
  source: string,
  shipments: ReadonlyArray<Shipment>,
): Array<number> => {
  const sandbox: Sandbox = {
    Math,
    Number,
    Boolean,
    String,
    Array,
    Object,
    JSON,
    Infinity,
    NaN,
    undefined,
    isFinite: (value: unknown) => Number.isFinite(value),
    isNaN: (value: unknown) => Number.isNaN(value),
    parseInt: Number.parseInt,
    parseFloat: Number.parseFloat,
    module: { exports: {} },
    exports: {},
    shipments: shipments.map((item) => ({ ...item })),
    results: undefined,
    __resolve: resolveExportedFunction,
  };
  sandbox.exports = sandbox.module.exports;

  try {
    vm.createContext(sandbox, {
      codeGeneration: { strings: false, wasm: false },
    });
    const script = new vm.Script(
      `"use strict";
${source}
let __calculateShipping;
if (typeof calculateShipping === "function") {
  __calculateShipping = calculateShipping;
} else {
  __calculateShipping = __resolve(module.exports);
}
if (typeof __calculateShipping !== "function") {
  throw new Error("Define function calculateShipping(input)");
}
results = shipments.map((input) => {
  const value = __calculateShipping(input);
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("calculateShipping must return a finite number");
  }
  return value;
});`,
      { filename: "solution.js" },
    );
    script.runInContext(sandbox, {
      timeout: evaluationTimeoutMs,
      displayErrors: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new HttpError(
      422,
      "SOLUTION_EXECUTION_FAILED",
      `Could not run calculateShipping: ${message}`,
      false,
    );
  }

  if (!Array.isArray(sandbox.results)) {
    throw new HttpError(
      422,
      "SOLUTION_EXECUTION_FAILED",
      "calculateShipping did not produce a result list",
    );
  }

  const results: Array<number> = [];
  for (const value of sandbox.results) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new HttpError(
        422,
        "SOLUTION_EXECUTION_FAILED",
        "calculateShipping must return a finite number",
      );
    }
    results.push(value);
  }
  return results;
};
