import { describe, expect, test } from "bun:test";

import { normalizePicturePath } from "../src/picture-upload.js";

describe("picture upload paths", () => {
  test("accepts a POSIX path pasted with shell-escaped spaces", () => {
    expect(
      normalizePicturePath(
        "/Users/cuevaio/Downloads/Generated\\ image\\ 1.png",
      ),
    ).toBe("/Users/cuevaio/Downloads/Generated image 1.png");
  });
});
