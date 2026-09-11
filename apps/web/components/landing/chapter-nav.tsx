"use client";

import { chromeCopy, worldChapters } from "@/components/landing/content";
import { landingHudClassName } from "@/components/landing/shell";

export function scrollWorldChapter(progress: number) {
  const section = document.getElementById("world");
  if (!section) {
    return;
  }

  const total = section.offsetHeight - window.innerHeight;
  let offset = section.offsetTop;
  if (total > 0) {
    offset += total * progress;
  }

  window.scrollTo({ top: offset, behavior: "auto" });
}

export function LandingChapterNav({
  className,
  onNavigate,
}: {
  readonly className?: string;
  readonly onNavigate?: () => void;
}) {
  return (
    <nav aria-label={chromeCopy.worldChapters} className={className}>
      {worldChapters.map((chapter) => (
        <button
          className="text-left"
          key={chapter.id}
          onClick={() => {
            scrollWorldChapter(chapter.progress);
            onNavigate?.();
          }}
          type="button"
        >
          {chapter.label}
        </button>
      ))}
    </nav>
  );
}

export function LandingChapterRail() {
  return (
    <div className="pointer-events-none fixed top-1/2 left-4 z-30 hidden -translate-y-1/2 lg:block">
      <LandingChapterNav
        className={`pointer-events-auto flex flex-col gap-3 text-[10px] text-[var(--hud-muted)] ${landingHudClassName}`}
      />
    </div>
  );
}
