import { HERO_SCENE_MODEL_URL } from "@/components/landing/hero-scene";

/** Document-level preload for the hero citadel. Same URL the Canvas loads. */
export const HERO_MODEL_PRELOAD = {
  href: HERO_SCENE_MODEL_URL,
  as: "fetch",
  type: "model/gltf-binary",
  crossOrigin: "anonymous",
} as const;

export function startHeroModelPreload(): void {
  if (typeof fetch !== "function") {
    return;
  }

  void fetch(HERO_MODEL_PRELOAD.href, {
    cache: "force-cache",
    credentials: "omit",
    mode: "cors",
  });
}
