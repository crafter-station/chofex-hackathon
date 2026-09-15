"use client";

import { cn } from "@chofex/ui/lib/utils";

import { worldChapters } from "@/components/landing/content";
import {
  type SiteChapter,
  stationScrollProgress,
} from "@/components/landing/sacred-valley-flight";
import { worldScrollTop } from "@/components/landing/sacred-valley-geometry";

export function scrollWorldToChapter(
  section: HTMLElement | null,
  chapter: SiteChapter,
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
    // The middle of the site's dwell, so the jump lands where the camera is
    // parked rather than at the moment it is still settling.
    progress: stationScrollProgress(chapter),
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
  readonly chapter: SiteChapter;
  readonly onSelect: (chapter: SiteChapter) => void;
}) {
  return (
    <nav
      aria-label="Capítulos del mundo"
      className="pointer-events-auto absolute top-1/2 left-3 z-20 -translate-y-1/2 sm:left-6"
    >
      <ol className="relative flex flex-col gap-4">
        <span
          aria-hidden="true"
          className="absolute top-1.5 bottom-1.5 left-[5px] w-px bg-[var(--hud-type)]/40"
        />
        {worldChapters.map((item) => {
          const active = item.id === chapter;
          let dotClass =
            "border-[var(--hud-type)] bg-[var(--hud-paper)] group-hover:border-[var(--hud-status)]";
          if (active) {
            dotClass = "border-[var(--hud-status)] bg-[var(--hud-status)]";
          }

          return (
            <li key={item.id}>
              <button
                aria-current={active ? "step" : undefined}
                aria-label={item.label}
                className="group relative flex size-6 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hud-accent)]"
                onClick={() => {
                  onSelect(item.id);
                }}
                type="button"
              >
                <span
                  className={cn("size-2.5 rounded-full border", dotClass)}
                />
                {/*
                 * Named on hover only. Showing the active stop's name
                 * permanently duplicated the chapter panel's own eyebrow — the
                 * panel already reads "04 / Ollantaytambo · 2,792 m" — and the
                 * longer names ran on underneath it.
                 */}
                <span
                  className={cn(
                    "pointer-events-none absolute left-8 whitespace-nowrap font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.18em] uppercase opacity-0 transition-opacity group-hover:opacity-100",
                    active
                      ? "text-[var(--hud-type)]"
                      : "text-[var(--hud-type)]/70",
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
