import { describe, expect, test } from "bun:test";

import { confirmedPictureUrl } from "./pictures";

describe("accepted participant picture confirmation", () => {
  test("uses only the explicitly confirmed source", () => {
    const options = {
      clerkPictureUrl: "https://img.clerk.com/ada.jpg",
      githubUrl: "https://github.com/ada",
      uploadedPictureUrl:
        "https://store.public.blob.vercel-storage.com/ada.jpg",
    };

    expect(confirmedPictureUrl("clerk", options)).toBe(options.clerkPictureUrl);
    expect(confirmedPictureUrl("github", options)).toBe(
      "https://github.com/ada.png?size=112",
    );
    expect(confirmedPictureUrl("upload", options)).toBe(
      options.uploadedPictureUrl,
    );
  });

  test("rejects a selected source that is unavailable", () => {
    expect(() => confirmedPictureUrl("github", {})).toThrow(
      "The selected github picture is not available",
    );
  });
});
