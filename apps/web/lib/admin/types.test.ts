import { expect, test } from "bun:test";

import { parseCandidateFilter } from "./types";

test("parses the completed challenge participant filter", () => {
  expect(parseCandidateFilter("challenge_completed")).toBe(
    "challenge_completed",
  );
});

test("rejects an unknown participant filter", () => {
  expect(parseCandidateFilter("completed")).toBeUndefined();
});
