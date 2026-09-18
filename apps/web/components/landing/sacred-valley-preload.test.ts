import { expect, test } from "bun:test";

import {
  HERO_MODEL_IDLE_TIMEOUT_MS,
  scheduleWhenIdle,
} from "./sacred-valley-preload";

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
