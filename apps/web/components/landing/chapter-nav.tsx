"use client";

import { chromeCopy } from "@/components/landing/content";
import { worldChapters } from "@/components/landing/content";
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
      {worldChapters.map((chapter) => (
        <button
          className="text-left"
          key={chapter.id}
          onClick={() => {
            const section = document.getElementById("world");
            scrollWorldToChapter(section, chapter.id);
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
