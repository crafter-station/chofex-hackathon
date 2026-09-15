import { expect, test } from "bun:test";

import { isEnglishPath } from "./document-lang";

test("treats the marketing landing as Spanish", () => {
  expect(isEnglishPath("/")).toBe(false);
  expect(isEnglishPath("/challenges")).toBe(false);
  expect(isEnglishPath("/challenges/black-box")).toBe(false);
});

test("keeps admin and legal routes in English", () => {
  expect(isEnglishPath("/admin/participants")).toBe(true);
  expect(isEnglishPath("/terms")).toBe(true);
  expect(isEnglishPath("/privacy")).toBe(true);
  expect(isEnglishPath("/welcome")).toBe(true);
});
