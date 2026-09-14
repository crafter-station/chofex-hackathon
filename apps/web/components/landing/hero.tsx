"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  facts,
  heroCopy,
  sponsorsCopy,
  worldChapterCopy,
} from "@/components/landing/content";
import { HeroScene } from "@/components/landing/hero-scene";
import { HudLabel } from "@/components/landing/hud";
import {
  type SiteChapter,
  stationAt,
} from "@/components/landing/sacred-valley-flight";
import { SacredValleyScene } from "@/components/landing/sacred-valley-scene";
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
      className="landing-world-motion pointer-events-none absolute inset-0 z-20 mx-auto flex h-dvh w-full max-w-7xl items-end py-12 pt-24 pr-4 pl-16 sm:pr-8 sm:pl-24 lg:items-center"
      style={{
        opacity: focus,
        transform: `translateY(${(1 - focus) * 12}px)`,
      }}
    >
      <div className="landing-glass-panel max-w-xl p-5 text-[var(--hud-type)] sm:p-7">
        <HudLabel className="mb-4 text-[var(--hud-type)]/60">
          {copy.eyebrow}
        </HudLabel>
        <h2 className="max-w-[12ch] font-[family-name:var(--font-landing-display)] text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.88] tracking-[-0.025em] uppercase">
          {copy.title}
        </h2>
        <div className="mt-6 grid gap-5 border-[var(--hud-type)]/15 border-t pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <p className="max-w-lg text-base leading-relaxed text-[var(--hud-type)]/78">
            {copy.body}
          </p>
          <div className="sm:text-right">
            <p className="font-[family-name:var(--font-landing-display)] text-4xl leading-none text-[var(--hud-accent)]">
              {copy.metric}
            </p>
            <HudLabel className="mt-2 text-[var(--hud-type)]/55">
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const update = () => {
      const next = readProgress(section);
      progressRef.current = next;

      const station = stationAt(next);
      setChapter((current) => (current === station.id ? current : station.id));
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
          <SacredValleyScene progressRef={progressRef} />
        </HeroScene>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#07152b]/70 via-[#07152b]/28 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#07152b]/50 via-transparent to-[#07152b]/20"
        />

        <div
          className={`landing-world-motion pointer-events-none relative z-20 mx-auto flex h-dvh min-h-[42rem] w-full max-w-7xl flex-col justify-between pt-20 pr-4 pb-8 pl-16 sm:pr-8 sm:pl-24 ${
            atOverlook ? "opacity-100" : "opacity-0"
          }`}
        >
          <HudLabel className="text-[var(--hud-type)]">
            {heroCopy.channel}
          </HudLabel>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="landing-type-meta mb-4 text-[var(--hud-type)]">
                {heroCopy.eyebrow}
              </p>
              <h1 className="max-w-[12ch]">
                <span
                  className={`${landingDisplayClassName} block text-[clamp(3.4rem,11vw,8.5rem)] text-[var(--hud-type)]`}
                >
                  {heroCopy.titleLead}
                </span>
                <span
                  className={`${landingDisplayClassName} block text-[clamp(3.4rem,11vw,8.5rem)] text-[var(--hud-accent)]`}
                >
                  {heroCopy.titleAccent}
                </span>
              </h1>
              <p className="landing-type-lede mt-5 max-w-xl text-[var(--hud-type)]">
                {heroCopy.lede}
              </p>
              <p className="mt-2 text-sm text-[var(--hud-type)]/70 sm:text-base">
                {heroCopy.meta}
              </p>
            </div>

            <a
              className={`pointer-events-auto w-full lg:w-auto ${landingCtaClassName}`}
              href="#apply"
            >
              <span>{heroCopy.cta}</span>
              <span className="mt-1 text-[10px] tracking-[0.16em] text-[var(--hud-paper)]/80">
                {heroCopy.ctaMeta}
              </span>
            </a>
          </div>

          <div className="flex flex-col gap-5">
            <ul className="grid grid-cols-2 border-[var(--hud-type)]/20 border-y lg:grid-cols-4">
              {facts.map((fact) => (
                <li
                  className="border-[var(--hud-type)]/15 border-r px-3 py-3 text-[var(--hud-type)] last:border-r-0"
                  key={fact.label}
                >
                  <HudLabel className="mb-1 text-[var(--hud-type)]/55">
                    {fact.label}
                  </HudLabel>
                  <p className="font-[family-name:var(--font-landing-display)] text-xl leading-none">
                    {fact.value}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--hud-paper)] px-3 py-2">
                  <Image
                    alt={sponsorsCopy.mark}
                    className="h-auto w-24"
                    height={sponsorsCopy.logoHeight}
                    priority
                    src={sponsorsCopy.logoSrc}
                    width={sponsorsCopy.logoWidth}
                  />
                </div>
                <div className="landing-type-meta text-[var(--hud-type)]/65">
                  <p>{heroCopy.sponsor}</p>
                  <p className="mt-1">{heroCopy.organizer}</p>
                </div>
              </div>
              <a
                className="pointer-events-auto text-[var(--hud-type)]"
                href="#why"
              >
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

        <WorldChapterRail
          chapter={chapter}
          onSelect={(next) => {
            scrollWorldToChapter(sectionRef.current, next);
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="h-[260svh] min-h-[135rem] md:h-[340svh] md:min-h-[190rem]"
      />
    </section>
  );
}
