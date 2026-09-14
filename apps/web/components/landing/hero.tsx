"use client";

import { useEffect, useRef, useState } from "react";

import {
  facts,
  heroCopy,
  worldChapterCopy,
} from "@/components/landing/content";
import { HeroScene } from "@/components/landing/hero-scene";
import { HudLabel } from "@/components/landing/hud";
import {
  type SiteChapter,
  stationAt,
} from "@/components/landing/sacred-valley-flight";
import type { ProjectedTarget } from "@/components/landing/sacred-valley-geometry";
import { SacredValleyScene } from "@/components/landing/sacred-valley-scene";
import { ScanHud } from "@/components/landing/scan-hud";
import {
  landingCtaClassName,
  landingDisplayClassName,
} from "@/components/landing/shell";
import {
  scrollWorldToChapter,
  WorldChapterRail,
} from "@/components/landing/world-chapter-rail";

function readProgress(section: HTMLElement): number {
  const total = section.offsetHeight - window.innerHeight;
  if (total <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, -section.getBoundingClientRect().top / total));
}

/**
 * One site's panel.
 *
 * `focus` comes straight from the flight: 1 while the camera is parked, 0 in
 * the middle of a transfer. Driving opacity from it means the copy is tied to
 * where the camera actually is, rather than to a scroll threshold that would
 * drift out of step the moment a station moves.
 */
function ChapterPanel({
  chapter,
  focus,
}: {
  readonly chapter: Exclude<SiteChapter, "overlook">;
  readonly focus: number;
}) {
  const copy = worldChapterCopy[chapter];

  return (
    <div
      aria-hidden={focus < 0.5}
      // Left padding clears the chapter rail, which now carries labels.
      className="landing-world-motion pointer-events-none absolute inset-0 z-20 mx-auto flex h-dvh w-full max-w-[1800px] items-end py-12 pt-24 pr-4 pl-16 sm:pr-8 sm:pl-24 lg:items-center"
      style={{
        opacity: focus,
        transform: `translateY(${(1 - focus) * 12}px)`,
      }}
    >
      <div className="landing-glass-panel max-w-2xl p-5 sm:p-8">
        <HudLabel className="mb-4 text-[var(--hud-action)]">{copy.eyebrow}</HudLabel>
        <h2 className="max-w-[11ch] font-[family-name:var(--font-landing-display)] text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.86] tracking-[-0.03em] uppercase">
          {copy.title}
        </h2>
        <div className="mt-6 grid gap-5 border-[var(--hud-ink)]/12 border-t pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <p className="max-w-lg text-base leading-relaxed text-[var(--hud-ink)]/80">
            {copy.body}
          </p>
          <div className="sm:text-right">
            <p className="font-[family-name:var(--font-landing-display)] text-4xl leading-none text-[var(--hud-status)]">
              {copy.metric}
            </p>
            <HudLabel className="mt-2 text-[var(--hud-ink)]/60">
              {copy.metricLabel}
            </HudLabel>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [chapter, setChapter] = useState<SiteChapter>("overlook");
  const [focus, setFocus] = useState(1);
  const [targets, setTargets] = useState<ProjectedTarget[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const update = () => {
      const next = readProgress(section);
      progressRef.current = next;

      const station = stationAt(next);
      setChapter((current) =>
        current === station.id ? current : station.id,
      );
      setFocus(station.focus);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const atOverlook = chapter === "overlook";

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#173c52]"
      id="world"
    >
      <div className="sticky top-0 h-dvh min-h-[42rem] overflow-hidden">
        <HeroScene>
          <SacredValleyScene onTargets={setTargets} progressRef={progressRef} />
        </HeroScene>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#07152b]/20 via-transparent to-[#07152b]/42"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 hud-scanlines"
        />

        <div
          className={`landing-world-motion pointer-events-none relative z-20 mx-auto flex h-dvh min-h-[42rem] w-full max-w-[1800px] flex-col justify-between pt-20 pr-4 pb-8 pl-16 sm:pr-8 sm:pl-24 ${
            atOverlook ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <HudLabel className="text-[var(--hud-type)]">{heroCopy.channel}</HudLabel>
            <HudLabel className="hidden text-[var(--hud-muted)] sm:block">
              {heroCopy.navStatus}
            </HudLabel>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="landing-type-meta mb-4 inline-block bg-[var(--hud-field)] px-3 py-1 text-[var(--hud-ink)]">
                {heroCopy.eyebrow}
              </p>
              <h1 className="max-w-[12ch]">
                <span
                  className={`${landingDisplayClassName} block text-[clamp(4.6rem,16vw,12rem)] text-[var(--hud-type)]`}
                >
                  {heroCopy.titleLead}
                </span>
                <span
                  className={`${landingDisplayClassName} block text-[clamp(4.6rem,16vw,12rem)] text-[var(--hud-status)]`}
                >
                  {heroCopy.titleAccent}
                </span>
              </h1>
              <p className="landing-type-lede mt-5 max-w-xl">{heroCopy.lede}</p>
              <p className="mt-2 text-sm text-[var(--hud-muted)] sm:text-base">
                {heroCopy.meta}
              </p>
            </div>

            <a
              className={`pointer-events-auto w-full lg:w-auto ${landingCtaClassName}`}
              href="#apply"
            >
              <span>{heroCopy.cta}</span>
              <span className="mt-1 text-[10px] tracking-[0.16em] text-[var(--hud-ink)]">
                {heroCopy.ctaMeta}
              </span>
            </a>
          </div>

          <div className="flex flex-col gap-5">
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {facts.map((fact) => (
                <li
                  className="hud-box bg-[#071a34]/55 px-3 py-3 shadow-[0_14px_40px_rgba(1,8,20,0.12)] backdrop-blur-sm"
                  key={fact.label}
                >
                  <HudLabel className="mb-1 text-[var(--hud-type)]">
                    {fact.label}
                  </HudLabel>
                  <p className="font-[family-name:var(--font-landing-display)] text-xl leading-none">
                    {fact.value}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex items-end justify-between gap-4">
              <p className="landing-type-meta text-[var(--hud-muted)]">
                {heroCopy.sponsor}
              </p>
              <a className="pointer-events-auto text-[var(--hud-type)]" href="#why">
                <span className="sr-only">{heroCopy.skipToWhy}</span>
                <span
                  aria-hidden="true"
                  className="block text-3xl leading-none"
                >
                  ⌄
                </span>
              </a>
            </div>
          </div>
        </div>

        {atOverlook ? null : (
          <ChapterPanel
            chapter={chapter as Exclude<SiteChapter, "overlook">}
            focus={focus}
          />
        )}

        <ScanHud
          focus={focus}
          station={chapter}
          targets={targets}
          visible={!atOverlook}
        />

        <WorldChapterRail
          chapter={chapter}
          onSelect={(next) => {
            scrollWorldToChapter(sectionRef.current, next);
          }}
        />
      </div>
      {/*
       * Six stops, each holding still for a readable beat, need the runway.
       * At 640svh a site's dwell is roughly half a viewport of scrolling.
       */}
      <div aria-hidden="true" className="h-[640svh] min-h-[240rem]" />
    </section>
  );
}
