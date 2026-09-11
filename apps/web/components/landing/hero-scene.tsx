import { cn } from "@chofex/ui/lib/utils";
import type { ReactNode } from "react";

export const HERO_SCENE_ROOT_ID = "hero-scene";

/** Locked subject for the R3F teammate: navigable Machu Picchu world. */
export const HERO_SCENE_THEME = "machu-picchu" as const;

/** Public URL for the Machu Picchu GLB this slot loads. */
export const HERO_SCENE_MODEL_URL = "/models/machu-picchu.glb" as const;

export type HeroSceneProps = {
  readonly className?: string;
  readonly children?: ReactNode;
};

function HeroSceneFallback() {
  return (
    <div className="relative size-full overflow-hidden bg-[#2f6fad]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#7eb7e8_0%,#2f6fad_42%,#1d3d2a_100%)]" />
      <div className="hero-scene-machu-hint absolute inset-x-[-10%] bottom-[-8%] h-[78%]" />
    </div>
  );
}

/**
 * Full-bleed Machu Picchu WebGL slot.
 * Three/R3F owns the navigable citadel/camera. Load
 * `HERO_SCENE_MODEL_URL` (`/models/machu-picchu.glb`) from a client
 * Canvas mounted as `children`. Do not paint landing type in here.
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
