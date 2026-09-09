import { describe, expect, test } from "bun:test";
import { randomBytes } from "node:crypto";

import { encryptSensitiveValue } from "./sensitive";

describe("sensitive participant data", () => {
  test("encrypts national IDs with randomized authenticated encryption", () => {
    const key = randomBytes(32).toString("base64");
    const first = encryptSensitiveValue("passport-123", key);
    const second = encryptSensitiveValue("passport-123", key);

    expect(first).toStartWith("v1:");
    expect(first).not.toContain("passport-123");
    expect(first).not.toBe(second);
  });

  test("rejects incorrectly sized keys", () => {
    expect(() => encryptSensitiveValue("secret", "bad-key")).toThrow(
      "Encryption key must decode to exactly 32 bytes",
    );
  });
});
