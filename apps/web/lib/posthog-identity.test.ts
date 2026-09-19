import { expect, test } from "bun:test";

import { syncPostHogIdentity } from "./posthog-identity";

function identityHarness() {
  const calls: string[] = [];
  const values = new Map<string, string>();
  let identifiedUserId: string | null = null;
  return {
    analytics: {
      get_property: (property: string) => {
        if (property === "$user_id") return identifiedUserId;
      },
      identify: (userId: string) => {
        identifiedUserId = userId;
        calls.push(`identify:${userId}`);
      },
      reset: () => {
        identifiedUserId = null;
        calls.push("reset");
      },
    },
    calls,
    storage: {
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    },
  };
}

test("identifies only after Clerk supplies a trusted user id", () => {
  const harness = identityHarness();
  syncPostHogIdentity(
    { isLoaded: false, userId: null },
    harness.analytics,
    harness.storage,
  );
  syncPostHogIdentity(
    { isLoaded: true, userId: "user_test_123" },
    harness.analytics,
    harness.storage,
  );

  expect(harness.calls).toEqual(["identify:user_test_123"]);
  expect(harness.calls.join(" ")).not.toContain("@");
});

test("resets PostHog on sign-out and before switching accounts", () => {
  const harness = identityHarness();
  syncPostHogIdentity(
    { isLoaded: true, userId: "user_a" },
    harness.analytics,
    harness.storage,
  );
  syncPostHogIdentity(
    { isLoaded: true, userId: "user_b" },
    harness.analytics,
    harness.storage,
  );
  syncPostHogIdentity(
    { isLoaded: true, userId: null },
    harness.analytics,
    harness.storage,
  );

  expect(harness.calls).toEqual([
    "identify:user_a",
    "reset",
    "identify:user_b",
    "reset",
  ]);
});

test("resets an identified user even when browser storage is unavailable", () => {
  const harness = identityHarness();
  const unavailableStorage = {
    getItem: () => {
      throw new Error("storage unavailable");
    },
    removeItem: () => {
      throw new Error("storage unavailable");
    },
    setItem: () => {
      throw new Error("storage unavailable");
    },
  };

  syncPostHogIdentity(
    { isLoaded: true, userId: "user_a" },
    harness.analytics,
    unavailableStorage,
  );
  syncPostHogIdentity(
    { isLoaded: true, userId: null },
    harness.analytics,
    unavailableStorage,
  );

  expect(harness.calls).toEqual(["identify:user_a", "reset"]);
});

test("runs privacy cleanup before reset and the next identification", () => {
  const harness = identityHarness();
  syncPostHogIdentity(
    { isLoaded: true, userId: "user_a" },
    harness.analytics,
    harness.storage,
  );
  syncPostHogIdentity(
    { isLoaded: true, userId: "user_b" },
    harness.analytics,
    harness.storage,
    () => harness.calls.push("before-reset"),
  );

  expect(harness.calls).toEqual([
    "identify:user_a",
    "before-reset",
    "reset",
    "identify:user_b",
  ]);
});
