import { describe, expect, test } from "bun:test";
import {
  CHUNK_RELOAD_GUARD_KEY,
  claimChunkReload,
  clearChunkReloadGuard,
  clerkUiComponentForPath,
  isChunkLoadError,
} from "./chunk-load-recovery";

function createStorage(initialValue: string | null = null) {
  let value = initialValue;
  return {
    getItem: () => value,
    setItem: (_key: string, nextValue: string) => {
      value = nextValue;
    },
    removeItem: () => {
      value = null;
    },
    value: () => value,
  };
}

describe("chunk load recovery", () => {
  test.each([
    ["ChunkLoadError", ""],
    ["TypeError", "Loading chunk 123 failed."],
    ["TypeError", "Loading CSS chunk 123 failed."],
    ["TypeError", "Failed to fetch dynamically imported module"],
    ["TypeError", "error loading dynamically imported module"],
    ["TypeError", "Importing a module script failed"],
  ])("recognizes %s: %s", (name, message) => {
    expect(isChunkLoadError({ name, message })).toBe(true);
  });

  test("does not classify unrelated errors as chunk failures", () => {
    expect(isChunkLoadError(new Error("Request failed"))).toBe(false);
  });

  test("allows only one automatic reload until a successful load", () => {
    const storage = createStorage();
    const getStorage = () => storage;

    expect(claimChunkReload(getStorage)).toBe(true);
    expect(storage.value()).toBe("true");
    expect(claimChunkReload(getStorage)).toBe(false);

    clearChunkReloadGuard(getStorage);
    expect(storage.value()).toBeNull();
    expect(claimChunkReload(getStorage)).toBe(true);
  });

  test("keeps storage method failures from escaping the recovery boundary", () => {
    const unavailableStorage = {
      getItem: () => {
        throw new Error("Storage blocked");
      },
      setItem: () => {
        throw new Error("Storage blocked");
      },
      removeItem: () => {
        throw new Error("Storage blocked");
      },
    };

    const getStorage = () => unavailableStorage;
    expect(claimChunkReload(getStorage)).toBe(false);
    expect(() => clearChunkReloadGuard(getStorage)).not.toThrow();
  });

  test("keeps storage getter failures from escaping the recovery boundary", () => {
    const getStorage = () => {
      throw new Error("Storage getter blocked");
    };

    expect(claimChunkReload(getStorage)).toBe(false);
    expect(() => clearChunkReloadGuard(getStorage)).not.toThrow();
  });

  test("uses a stable session-storage key", () => {
    expect(CHUNK_RELOAD_GUARD_KEY).toBe("hta:chunk-reload-attempted");
  });

  test("waits for Clerk auth UI on its catch-all routes", () => {
    expect(clerkUiComponentForPath("/sign-in")).toBe("SignIn");
    expect(clerkUiComponentForPath("/sign-in/factor-one")).toBe("SignIn");
    expect(clerkUiComponentForPath("/sign-up")).toBe("SignUp");
    expect(clerkUiComponentForPath("/sign-up/verify")).toBe("SignUp");
    expect(clerkUiComponentForPath("/challenges")).toBeNull();
  });
});
