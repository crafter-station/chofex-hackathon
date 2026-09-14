import { SACRED_VALLEY_GLB } from "@/components/landing/sacred-valley-geometry";

/** Document-level preload for the hero terrain. Same URL the Canvas loads. */
export const HERO_MODEL_PRELOAD = {
  href: SACRED_VALLEY_GLB,
  as: "fetch",
  type: "model/gltf-binary",
  crossOrigin: "anonymous",
} as const;

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
