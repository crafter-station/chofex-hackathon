export const HERO_MODEL_IDLE_TIMEOUT_MS = 800;

/**
 * Run after first paint, not on the document critical path.
 *
 * The terrain is the largest landing transfer. Starting it from markup or from
 * the first client tick races the lockup (LCP) and the poster. Idle — with a
 * short timeout so a busy main thread cannot starve it — keeps the mesh off
 * that opening while still arriving before the reader looks away.
 */
export function scheduleWhenIdle(
  task: () => void,
  timeout = HERO_MODEL_IDLE_TIMEOUT_MS,
): () => void {
  if (typeof requestIdleCallback === "function") {
    const id = requestIdleCallback(task, { timeout });
    return () => {
      cancelIdleCallback(id);
    };
  }

  const timer = setTimeout(task, 0);
  return () => {
    clearTimeout(timer);
  };
}
