import { describe, expect, test } from "bun:test";

import { grantsApplicationReviewAccess } from "./roles";

describe("grantsApplicationReviewAccess", () => {
  test("grants access for the application reviewer role", () => {
    expect(
      grantsApplicationReviewAccess({ roles: ["application_reviewer"] }),
    ).toBe(true);
  });

  test("preserves support for the legacy admin role", () => {
    expect(grantsApplicationReviewAccess({ role: "admin" })).toBe(true);
    expect(grantsApplicationReviewAccess({ roles: ["admin"] })).toBe(true);
  });

  test("rejects unrelated or malformed roles", () => {
    expect(grantsApplicationReviewAccess({ roles: ["participant"] })).toBe(
      false,
    );
    expect(
      grantsApplicationReviewAccess({ roles: "application_reviewer" }),
    ).toBe(false);
    expect(grantsApplicationReviewAccess({})).toBe(false);
  });
});
