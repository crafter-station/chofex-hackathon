import { expect, test } from "bun:test";

import { SACRED_VALLEY_MODEL_PATH } from "./sacred-valley-place";
import {
  HERO_MODEL_IDLE_TIMEOUT_MS,
  HERO_MODEL_PRELOAD,
  scheduleWhenIdle,
} from "./sacred-valley-preload";

test("preloads the same stamped URL the canvas will fetch", () => {
  // Preloading the unstamped path would warm the cache with a different URL
  // than the loader asks for, which costs a download and saves nothing.
  expect(HERO_MODEL_PRELOAD.href.startsWith(SACRED_VALLEY_MODEL_PATH)).toBe(
    true,
  );
  expect(HERO_MODEL_PRELOAD.href).toMatch(/\?v=[0-9a-f]{8,}$/);
  expect(HERO_MODEL_PRELOAD.as).toBe("fetch");
  expect(HERO_MODEL_PRELOAD.crossOrigin).toBe("anonymous");
});

test("scheduleWhenIdle uses requestIdleCallback when the browser has it", () => {
  const calls: Array<{ timeout: number }> = [];
  const originalIdle = globalThis.requestIdleCallback;
  const originalCancel = globalThis.cancelIdleCallback;

  globalThis.requestIdleCallback = ((
    _task: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => {
    calls.push({ timeout: options?.timeout ?? -1 });
    return 7;
  }) as typeof requestIdleCallback;
  globalThis.cancelIdleCallback = ((id: number) => {
    calls.push({ timeout: -id });
  }) as typeof cancelIdleCallback;

  try {
    const cancel = scheduleWhenIdle(() => undefined);
    expect(calls).toEqual([{ timeout: HERO_MODEL_IDLE_TIMEOUT_MS }]);
    cancel();
    expect(calls).toEqual([
      { timeout: HERO_MODEL_IDLE_TIMEOUT_MS },
      { timeout: -7 },
    ]);
  } finally {
    globalThis.requestIdleCallback = originalIdle;
    globalThis.cancelIdleCallback = originalCancel;
  }
});
