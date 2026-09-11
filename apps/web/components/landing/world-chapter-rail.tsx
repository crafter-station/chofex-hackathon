"use client";

import { cn } from "@chofex/ui/lib/utils";

import {
  chapterStartProgress,
  WORLD_CHAPTERS,
  type WorldChapter,
  worldScrollTop,
} from "@/components/landing/machu-picchu-geometry";

export function scrollWorldToChapter(
  section: HTMLElement | null,
  chapter: WorldChapter,
): void {
  if (!section) {
    return;
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const top = worldScrollTop({
    sectionOffsetTop: section.getBoundingClientRect().top + window.scrollY,
    sectionHeight: section.offsetHeight,
    viewportHeight: window.innerHeight,
    progress: chapterStartProgress(chapter),
  });

  window.scrollTo({
    top,
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

export function WorldChapterRail({
  chapter,
  onSelect,
}: {
  readonly chapter: WorldChapter;
  readonly onSelect: (chapter: WorldChapter) => void;
}) {
  return (
    <nav
      aria-label="Capítulos del mundo"
      className="pointer-events-auto absolute top-[40%] left-3 z-20 -translate-y-1/2 sm:left-6"
    >
      <ol className="relative flex flex-col gap-4">
        <span
          aria-hidden="true"
          className="absolute top-1.5 bottom-1.5 left-[5px] w-px bg-[#f5f5f5]/40"
        />
        {WORLD_CHAPTERS.map((item) => {
          const active = item.id === chapter;
          let dotClass =
            "border-[#f5f5f5] bg-[#0b0d10] group-hover:border-[#d6ff00]";
          if (active) {
            dotClass = "border-[#d6ff00] bg-[#d6ff00]";
          }

          return (
            <li key={item.id}>
              <button
                aria-current={active ? "step" : undefined}
                aria-label={item.label}
                className="group relative flex size-6 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d6ff00]"
                onClick={() => {
                  onSelect(item.id);
                }}
                type="button"
              >
                <span
                  className={cn("size-2.5 rounded-full border", dotClass)}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
