"use client";

import { chromeCopy } from "@/components/landing/content";
import {
  WORLD_CHAPTERS,
  type WorldChapter,
} from "@/components/landing/machu-picchu-geometry";
import { scrollWorldToChapter } from "@/components/landing/world-chapter-rail";

export function LandingChapterNav({
  className,
  onNavigate,
}: {
  readonly className?: string;
  readonly onNavigate?: () => void;
}) {
  return (
    <nav aria-label={chromeCopy.worldChapters} className={className}>
      {WORLD_CHAPTERS.map((chapter) => (
        <button
          className="text-left"
          key={chapter.id}
          onClick={() => {
            const section = document.getElementById("world");
            scrollWorldToChapter(section, chapter.id as WorldChapter);
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
