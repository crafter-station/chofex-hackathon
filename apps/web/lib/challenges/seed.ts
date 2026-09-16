import { createHash, createHmac } from "node:crypto";

const challengeSeedSecret = (): string => {
  const secret = process.env.CHALLENGE_SEED_SECRET;
  if (secret && secret.trim() !== "") return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("CHALLENGE_SEED_SECRET is required in production");
  }
  return "dev-challenge-seed-do-not-use-in-prod";
};

export const attemptSeed = (participantId: string, slug: string): string =>
  createHmac("sha256", challengeSeedSecret())
    .update(`${participantId}:${slug}`)
    .digest("hex");

export const uint32FromSeed = (seed: string): number =>
  createHash("sha256").update(seed).digest().readUInt32BE(0);

export const mulberry32 = (state: number): (() => number) => {
  let current = state >>> 0;
  return () => {
    current = (current + 0x6d2b79f5) >>> 0;
    let t = current;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const shareCodeFromSeed = (seed: string, length = 4): string =>
  createHash("sha256")
    .update(`share:${seed}`)
    .digest("hex")
    .slice(0, length)
    .toUpperCase();
