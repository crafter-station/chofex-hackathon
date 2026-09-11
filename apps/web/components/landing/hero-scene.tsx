import { cn } from "@chofex/ui/lib/utils";
import type { ReactNode } from "react";

export const HERO_SCENE_ROOT_ID = "hero-scene";

/** Locked subject for the R3F teammate: Moray, Valle Sagrado. */
export const HERO_SCENE_THEME = "moray" as const;

export type HeroSceneProps = {
  readonly className?: string;
  readonly children?: ReactNode;
};

function HeroSceneFallback() {
  return (
    <div className="relative size-full overflow-hidden bg-[#1b3044]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,#4d7fa3_0%,#1b3044_46%,#12181c_100%)]" />
      <div className="hero-scene-moray-hint absolute top-[54%] left-1/2 size-[160vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80" />
    </div>
  );
}

/**
 * Full-bleed Moray (Valle Sagrado) WebGL slot.
 * Three/R3F owns the concentric-terrace scene. Mount a client Canvas as
 * `children`, or replace the fallback. Do not paint landing type in here.
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
