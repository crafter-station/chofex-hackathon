import { SACRED_VALLEY_GLB } from "@/components/landing/sacred-valley-geometry";

/** Same URL the Canvas loads. Warmed only after WebGL is chosen. */
export const HERO_MODEL_PRELOAD = {
  href: SACRED_VALLEY_GLB,
  as: "fetch",
  type: "model/gltf-binary",
  crossOrigin: "anonymous",
} as const;

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

export function startHeroModelPreload(): void {
  if (typeof fetch !== "function") {
    return;
  }

  // Deliberately not `force-cache`. The terrain ships under a stable filename
  // and is rebuilt in place, and force-cache will happily serve a previous
  // build's mesh to anyone holding one. Warming the cache is the point here;
  // overriding revalidation is not.
  void fetch(HERO_MODEL_PRELOAD.href, {
    credentials: "omit",
    mode: "cors",
  });
}
