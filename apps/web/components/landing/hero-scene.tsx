import { cn } from "@chofex/ui/lib/utils";
import type { ReactNode } from "react";

export const HERO_SCENE_ROOT_ID = "hero-scene";

/** Locked subject for the R3F world: Machu Picchu citadel + valley. */
export const HERO_SCENE_THEME = "machu-picchu" as const;

export type HeroSceneProps = {
  readonly className?: string;
  readonly children?: ReactNode;
};

function HeroSceneFallback() {
  return (
    <div className="relative size-full overflow-hidden bg-[#0057ff]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,#7eb0ff_0%,#0057ff_42%,#07122b_100%)]" />
      <div className="absolute right-[8%] bottom-[18%] h-[38%] w-[46%] rounded-[40%] bg-[#e8ff00]/20 blur-3xl" />
    </div>
  );
}

/**
 * Full-bleed WebGL slot. Pass the Machu Picchu scene as `children`.
 * Do not paint landing type in here.
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
      data-hero-scene-theme={HERO_SCENE_THEME}
      id={HERO_SCENE_ROOT_ID}
    >
      {children ?? <HeroSceneFallback />}
    </div>
  );
}
