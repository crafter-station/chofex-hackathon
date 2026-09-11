import { cn } from "@chofex/ui/lib/utils";
import type { ReactNode } from "react";

export const HERO_SCENE_ROOT_ID = "hero-scene";

export type HeroSceneProps = {
  readonly className?: string;
  readonly children?: ReactNode;
};

function HeroSceneFallback() {
  return (
    <div className="relative size-full bg-[#0c0c0b]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_78%,#2a2e12_0%,#12140c_42%,#0c0c0b_68%,#050505_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050505] to-transparent" />
    </div>
  );
}

/**
 * Valle Sagrado WebGL slot. The Three/R3F scene mounts here.
 * Drop a client Canvas as `children`, or replace the fallback in this file.
 * Keep this root `absolute inset-0` so landing UI can stay painted above it.
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
      id={HERO_SCENE_ROOT_ID}
    >
      {children ?? <HeroSceneFallback />}
    </div>
  );
}
