import { describe, expect, test } from "bun:test";

import { publicDocumentUrl } from "../src/input.js";

describe("CLI registration input", () => {
  test("builds public policy links from API URLs with or without a slash", () => {
    expect(publicDocumentUrl("https://apply.chofex.com", "/terms")).toBe(
      "https://apply.chofex.com/terms",
    );
    expect(publicDocumentUrl("https://apply.chofex.com/", "/privacy")).toBe(
      "https://apply.chofex.com/privacy",
    );
  });
});
