import { expect, test } from "bun:test";

import { config } from "../src/config.js";

test("uses the canonical domain for API requests and participant links", () => {
  expect(config.apiUrl).toBe("https://hacktheandes.com");
  expect(config.publicSiteUrl).toBe("https://hacktheandes.com");
});
