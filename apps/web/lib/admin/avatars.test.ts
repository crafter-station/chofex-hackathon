import { describe, expect, test } from "bun:test";

import {
  candidateAvatarUrl,
  githubAvatarUrl,
  preferredAvatarUrl,
} from "./avatars";

describe("candidate avatars", () => {
  test("builds a GitHub avatar URL from a profile URL", () => {
    expect(githubAvatarUrl("https://github.com/octocat")).toBe(
      "https://github.com/octocat.png?size=112",
    );
  });

  test("rejects URLs that are not GitHub profiles", () => {
    expect(githubAvatarUrl("https://example.com/octocat")).toBeUndefined();
    expect(githubAvatarUrl("not a URL")).toBeUndefined();
  });

  test("prefers a Clerk profile image over the GitHub fallback", () => {
    expect(
      preferredAvatarUrl(
        "https://img.clerk.com/user.jpg",
        "https://github.com/octocat",
      ),
    ).toBe("https://img.clerk.com/user.jpg");
  });

  test("uses GitHub when Clerk does not have a profile image", () => {
    expect(preferredAvatarUrl(undefined, "https://github.com/octocat")).toBe(
      "https://github.com/octocat.png?size=112",
    );
  });

  test("leaves the avatar empty when neither source has a photo", () => {
    expect(preferredAvatarUrl(undefined, undefined)).toBeUndefined();
  });

  test("shows an available profile photo before badge picture confirmation", () => {
    expect(
      candidateAvatarUrl(
        undefined,
        "https://img.clerk.com/user.jpg",
        "https://github.com/octocat",
      ),
    ).toBe("https://img.clerk.com/user.jpg");
    expect(
      candidateAvatarUrl(undefined, undefined, "https://github.com/octocat"),
    ).toBe("https://github.com/octocat.png?size=112");
  });

  test("shows the confirmed badge picture once one is selected", () => {
    expect(
      candidateAvatarUrl(
        "https://pictures.example/confirmed.jpg",
        "https://img.clerk.com/user.jpg",
        "https://github.com/octocat",
      ),
    ).toBe("https://pictures.example/confirmed.jpg");
  });
});
