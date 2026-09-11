"use client";

import { useEffect, useRef, useState } from "react";

import {
  facts,
  heroCopy,
  valleySignal,
  worldChapterCopy,
} from "@/components/landing/content";
import { HeroScene } from "@/components/landing/hero-scene";
import { DeviceCard, HudLabel } from "@/components/landing/hud";
import {
  chapterFromProgress,
  type ProjectedTarget,
  type WorldChapter,
} from "@/components/landing/machu-picchu-geometry";
import { MachuPicchuScene } from "@/components/landing/machu-picchu-scene";
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

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [chapter, setChapter] = useState<WorldChapter>("hero");
  const [targets, setTargets] = useState<ProjectedTarget[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const update = () => {
      const next = readProgress(section);
      progressRef.current = next;
      const nextChapter = chapterFromProgress(next);
      setChapter((current) => {
        if (current === nextChapter) {
          return current;
        }
        return nextChapter;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const heroVisible = chapter === "hero";
  const valleyVisible = chapter === "valley";
  const scanVisible = chapter === "scan";

  let heroOpacity = "opacity-0";
  if (heroVisible) {
    heroOpacity = "opacity-100";
  }

  let valleyClass = "pointer-events-none opacity-0 translate-y-3";
  if (valleyVisible) {
    valleyClass = "opacity-100 translate-y-0";
  }

  let scanChapterClass = "pointer-events-none opacity-0 translate-y-3";
  if (scanVisible) {
    scanChapterClass = "opacity-100 translate-y-0";
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#173c52]"
      id="world"
    >
      <div className="sticky top-0 h-dvh min-h-[42rem] overflow-hidden">
        <HeroScene>
          <MachuPicchuScene onTargets={setTargets} progressRef={progressRef} />
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
          className={`landing-world-motion pointer-events-none relative z-20 mx-auto flex h-dvh min-h-[42rem] w-full max-w-[1800px] flex-col justify-between px-4 pt-20 pb-8 sm:px-8 ${heroOpacity}`}
        >
          <div className="flex items-start justify-between gap-4">
            <HudLabel className="text-[#d6ff00]">{heroCopy.channel}</HudLabel>
            <HudLabel className="hidden text-[var(--hud-muted)] sm:block">
              {heroCopy.navStatus}
            </HudLabel>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="landing-type-meta mb-4 inline-block bg-[#0057ff] px-3 py-1 text-[#f5f5f5]">
                {heroCopy.eyebrow}
              </p>
              <h1 className="max-w-[12ch]">
                <span
                  className={`${landingDisplayClassName} block text-[clamp(4.6rem,16vw,12rem)] text-[#f5f5f5]`}
                >
                  {heroCopy.titleLead}
                </span>
                <span
                  className={`${landingDisplayClassName} block text-[clamp(4.6rem,16vw,12rem)] text-[#d6ff00]`}
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
              <span className="mt-1 text-[10px] tracking-[0.16em] text-[#0b0d10]">
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
                  <HudLabel className="mb-1 text-[#d6ff00]">
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
              <a className="pointer-events-auto text-[#d6ff00]" href="#why">
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

        <div
          aria-hidden={!valleyVisible}
          className={`landing-world-motion absolute inset-0 z-20 mx-auto flex h-dvh w-full max-w-[1800px] items-end px-4 pt-24 pb-12 sm:px-8 lg:items-center ${valleyClass}`}
        >
          <div className="grid w-full items-end gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="landing-glass-panel max-w-2xl p-5 sm:p-8">
              <HudLabel className="mb-4 text-[#d6ff00]">
                {worldChapterCopy.valley.eyebrow}
              </HudLabel>
              <h2 className="max-w-[9ch] font-[family-name:var(--font-landing-display)] text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.82] tracking-[-0.03em] uppercase">
                {worldChapterCopy.valley.title}
              </h2>
              <div className="mt-6 grid gap-5 border-white/15 border-t pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
                <p className="max-w-lg text-base leading-relaxed text-white/78">
                  {worldChapterCopy.valley.body}
                </p>
                <div className="sm:text-right">
                  <p className="font-[family-name:var(--font-landing-display)] text-4xl leading-none text-[#d6ff00]">
                    {worldChapterCopy.valley.metric}
                  </p>
                  <HudLabel className="mt-2 text-white/60">
                    {worldChapterCopy.valley.metricLabel}
                  </HudLabel>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <DeviceCard
                accent={valleySignal.accent}
                body={valleySignal.body}
                code={valleySignal.code}
                mark={valleySignal.mark}
                title={valleySignal.title}
              />
            </div>
          </div>
        </div>

        <ScanHud targets={targets} visible={scanVisible} />
        <aside
          aria-hidden={!scanVisible}
          className={`landing-world-motion landing-glass-panel absolute right-4 bottom-12 z-30 w-[min(31rem,calc(100%-2rem))] p-5 sm:right-8 sm:p-7 ${scanChapterClass}`}
        >
          <div className="flex items-center justify-between gap-4">
            <HudLabel className="text-[#d6ff00]">
              {worldChapterCopy.scan.eyebrow}
            </HudLabel>
            <HudLabel className="text-white/60">
              {worldChapterCopy.scan.status}
            </HudLabel>
          </div>
          <h2 className="mt-5 max-w-[11ch] font-[family-name:var(--font-landing-display)] text-4xl leading-[0.88] tracking-[-0.03em] uppercase sm:text-6xl">
            {worldChapterCopy.scan.title}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
            {worldChapterCopy.scan.body}
          </p>
        </aside>
        <WorldChapterRail
          chapter={chapter}
          onSelect={(next) => {
            scrollWorldToChapter(sectionRef.current, next);
          }}
        />
      </div>
      <div aria-hidden="true" className="h-[300svh] min-h-[126rem]" />
    </section>
  );
}
