import { createCipheriv, randomBytes } from "node:crypto";

export const encryptSensitiveValue = (
  value: string,
  base64Key: string,
): string => {
  const key = Buffer.from(base64Key, "base64");
  if (key.length !== 32) {
    throw new Error("Encryption key must decode to exactly 32 bytes");
  }
  const initializationVector = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, initializationVector);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    initializationVector.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":");
};
