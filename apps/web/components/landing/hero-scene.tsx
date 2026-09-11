import { cn } from "@chofex/ui/lib/utils";
import type { ReactNode } from "react";

export const HERO_SCENE_ROOT_ID = "hero-scene";

/** Locked subject for the R3F scene: a navigable Sacred Valley world. */
export const HERO_SCENE_THEME = "sacred-valley" as const;

/** Public URL for the elevation-derived Sacred Valley GLB. */
export const HERO_SCENE_MODEL_URL = "/models/sacred-valley.glb" as const;

export type HeroSceneProps = {
  readonly className?: string;
  readonly children?: ReactNode;
};

function HeroSceneFallback() {
  return (
    <div className="size-full bg-[radial-gradient(circle_at_68%_12%,#bfe4f7_0%,#5598c9_35%,#173c52_72%,#07152b_100%)]" />
  );
}

/**
 * Full-bleed Sacred Valley WebGL slot.
 * Three/R3F owns the terrain/camera and a constrained look orbit.
 * Scroll still drives chapters. Load `HERO_SCENE_MODEL_URL`
 * (`/models/sacred-valley.glb`) from a client Canvas mounted as
 * `children`. Do not paint landing type in here.
 */
export function HeroScene({ className, children }: HeroSceneProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-auto absolute inset-0 z-0 overflow-hidden",
        className,
      )}
      data-hero-scene=""
      data-hero-scene-model={HERO_SCENE_MODEL_URL}
      data-hero-scene-theme={HERO_SCENE_THEME}
      id={HERO_SCENE_ROOT_ID}
    >
      {children ?? <HeroSceneFallback />}
    </div>
  );
}
