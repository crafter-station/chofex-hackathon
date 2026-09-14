import { describe, expect, test } from "bun:test";

import { rankingDisplayName } from "./names";

describe("ranking display names", () => {
  test("prefers a GitHub handle, then a first name with last initial", () => {
    expect(
      rankingDisplayName({
        githubUrl: "https://github.com/cuevaio",
        firstName: "Anthony",
        lastName: "Cueva",
        shareCode: "7A3F",
      }),
    ).toBe("cuevaio");
    expect(
      rankingDisplayName({
        firstName: "Ada",
        lastName: "Lovelace",
        shareCode: "7A3F",
      }),
    ).toBe("Ada L.");
    expect(rankingDisplayName({ shareCode: "7A3F" })).toBe("BOX-7A3F");
  });
});
