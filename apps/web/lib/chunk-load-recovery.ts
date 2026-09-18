export const CHUNK_RELOAD_GUARD_KEY = "hta:chunk-reload-attempted";

interface ErrorLike {
  readonly name?: string;
  readonly message?: string;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type StorageProvider = () => StorageLike;

type ClerkUiComponent = "SignIn" | "SignUp";

export function clerkUiComponentForPath(
  pathname: string,
): ClerkUiComponent | null {
  if (pathname === "/sign-in" || pathname.startsWith("/sign-in/")) {
    return "SignIn";
  }
  if (pathname === "/sign-up" || pathname.startsWith("/sign-up/")) {
    return "SignUp";
  }
  return null;
}

export function isChunkLoadError(error: ErrorLike): boolean {
  if (error.name === "ChunkLoadError") {
    return true;
  }

  const message = error.message ?? "";
  return (
    /loading (?:css )?chunk [^\s]+ failed/i.test(message) ||
    /failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /importing a module script failed/i.test(message)
  );
}

export function claimChunkReload(getStorage: StorageProvider): boolean {
  try {
    const storage = getStorage();
    if (storage.getItem(CHUNK_RELOAD_GUARD_KEY) === "true") {
      return false;
    }
    storage.setItem(CHUNK_RELOAD_GUARD_KEY, "true");
    return true;
  } catch {
    return false;
  }
}

export function clearChunkReloadGuard(getStorage: StorageProvider): void {
  try {
    const storage = getStorage();
    storage.removeItem(CHUNK_RELOAD_GUARD_KEY);
  } catch {
    // Storage is best-effort. A blocked store must not break the application.
  }
}
