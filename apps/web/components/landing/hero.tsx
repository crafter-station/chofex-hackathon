"use client";

import { useEffect, useRef, useState } from "react";

import { facts } from "@/components/landing/content";
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

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#0b0d10]"
      id="world"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <HeroScene>
          <MachuPicchuScene onTargets={setTargets} progressRef={progressRef} />
        </HeroScene>

        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#0b0d10]/18 via-transparent to-[#0b0d10]/28" />
        <div className="pointer-events-none absolute inset-0 z-10 hud-scanlines" />

        <div
          className={`pointer-events-none relative z-20 mx-auto flex h-dvh w-full max-w-[1800px] flex-col justify-between px-4 pt-6 pb-8 transition-opacity duration-500 sm:px-8 ${heroOpacity}`}
        >
          <div className="flex items-start justify-between gap-4">
            <HudLabel className="text-[#d6ff00]">
              {"hta / world-01 / machu picchu"}
            </HudLabel>
            <HudLabel className="text-[#f5f5f5]/70">nav unlocked</HudLabel>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="mb-4 inline-block bg-[#0057ff] px-3 py-1 font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.2em] text-[#f5f5f5] uppercase">
                best of the best · lima
              </p>
              <h1 className="max-w-[12ch]">
                <span
                  className={`${landingDisplayClassName} block text-[clamp(4.6rem,16vw,12rem)] text-[#f5f5f5]`}
                >
                  hack the
                </span>
                <span
                  className={`${landingDisplayClassName} block text-[clamp(4.6rem,16vw,12rem)] text-[#d6ff00]`}
                >
                  andes
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#f5f5f5]/80 sm:text-base">
                Hackathon selectivo de IA · Lima, Perú · 10–11 oct 2026
              </p>
            </div>

            <a
              className={`pointer-events-auto w-full lg:w-auto ${landingCtaClassName}`}
              href="#apply"
            >
              <span>Aplicar ahora</span>
              <span className="mt-1 text-[10px] tracking-[0.16em] text-[#0b0d10]/70">
                10–11 oct 2026 · presencial
              </span>
            </a>
          </div>

          <div className="flex flex-col gap-5">
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {facts.map((fact) => (
                <li
                  className="hud-box bg-[#0b0d10]/45 px-3 py-3 backdrop-blur-[2px]"
                  key={fact.label}
                >
                  <HudLabel className="mb-1 text-[#d6ff00]">
                    {fact.label}
                  </HudLabel>
                  <p className="font-[family-name:var(--font-landing-display)] text-xl leading-none uppercase">
                    {fact.value}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex items-end justify-between gap-4">
              <p className="font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.18em] text-[#f5f5f5]/75 uppercase">
                sponsored by chofex
              </p>
              <a className="pointer-events-auto text-[#d6ff00]" href="#judges">
                <span className="sr-only">Bajar a jueces</span>
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

        <aside
          className={`absolute right-4 bottom-24 z-20 w-[min(22rem,calc(100%-2rem))] transition duration-500 sm:right-8 ${valleyClass}`}
        >
          <DeviceCard
            accent="yellow"
            body="Filtra por rigor. Si el sistema no aguanta, no entra."
            code="J-01"
            handle="QUISPE"
            title="Juez 01 · IA aplicada"
          />
        </aside>

        <ScanHud targets={targets} visible={scanVisible} />
      </div>
      <div aria-hidden="true" className="h-[320vh]" />
    </section>
  );
}
