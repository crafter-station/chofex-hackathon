"use client";

import { useEffect, useRef, useState } from "react";

import "@/components/landing/landing.css";
import { HeroScene } from "@/components/landing/hero-scene";
import { JudgePanel } from "@/components/landing/judge-panel";
import {
  chapterFromProgress,
  type ProjectedTarget,
  type WorldChapter,
} from "@/components/landing/machu-picchu-geometry";
import { MachuPicchuScene } from "@/components/landing/machu-picchu-scene";
import { ScanHud } from "@/components/landing/scan-hud";
import { landingCtaClassName } from "@/components/landing/shell";

function readProgress(section: HTMLElement): number {
  const total = section.offsetHeight - window.innerHeight;
  if (total <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, -section.getBoundingClientRect().top / total));
}

function ArWindow({
  title,
  children,
  className,
}: {
  readonly title: string;
  readonly children: string;
  readonly className?: string;
}) {
  return (
    <div className={`landing-ar-window rounded-md ${className ?? ""}`}>
      <div className="landing-ar-window__bar">
        <span className="size-1.5 rounded-full bg-white" />
        <span className="size-1.5 rounded-full bg-[#e8ff00]" />
        <span>{title}</span>
      </div>
      <p className="px-3 py-2 font-mono text-[11px] leading-relaxed tracking-[0.04em] lowercase">
        {children}
      </p>
    </div>
  );
}

export function LandingWorld() {
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

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0057ff] text-white"
      id="world"
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        <HeroScene>
          <MachuPicchuScene onTargets={setTargets} progressRef={progressRef} />
        </HeroScene>

        <div className="landing-jagged" />
        <div className="landing-jagged landing-jagged--br" />

        <div
          className={`pointer-events-none relative z-20 mx-auto flex h-dvh w-full max-w-[1800px] flex-col justify-between px-4 pt-8 pb-8 transition-opacity duration-500 sm:px-8 ${heroOpacity}`}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em] text-[#e8ff00] uppercase">
                looking for the best of the best
              </p>
              <h1 className="landing-hero-title mt-3 max-w-[12ch] lowercase">
                <span className="block font-[family-name:var(--font-landing-display)] text-[clamp(4.4rem,16vw,12.5rem)] leading-[0.74] font-extrabold tracking-[-0.07em]">
                  hack the
                </span>
                <span className="block font-[family-name:var(--font-landing-display)] text-[clamp(4.4rem,16vw,12.5rem)] leading-[0.74] font-extrabold tracking-[-0.07em]">
                  andes
                </span>
              </h1>
            </div>
            <a
              className={`pointer-events-auto landing-fade-in mt-2 w-full lg:mt-10 lg:w-auto ${landingCtaClassName}`}
              href="#apply"
            >
              <span>Aplicar ahora</span>
              <span className="mt-0.5 font-mono text-[9px] font-normal tracking-[0.08em] text-[#07122b]/70 lowercase md:text-[11px]">
                10–11 oct 2026 · presencial
              </span>
            </a>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md font-mono text-[11px] tracking-[0.08em] text-white/80 lowercase sm:text-sm">
              hackathon selectivo de IA · lima, perú · mueve el cursor y
              desplázate para entrar al valle
            </p>
            <p className="font-mono text-[10px] tracking-[0.16em] text-white/70 lowercase">
              sponsored by chofex
            </p>
          </div>
        </div>

        {heroVisible ? (
          <>
            <ArWindow
              className="pointer-events-none absolute top-[22%] right-[8%] z-20 hidden w-44 md:block"
              title="loc / cusco"
            >
              machu picchu · citadel live
            </ArWindow>
            <ArWindow
              className="pointer-events-none absolute bottom-[28%] left-[8%] z-20 hidden w-52 md:block"
              title="status"
            >
              seeking · selectivo · lima
            </ArWindow>
          </>
        ) : null}

        <JudgePanel visible={valleyVisible} />
        <ScanHud targets={targets} visible={scanVisible} />
      </div>
      <div aria-hidden="true" className="h-[320vh]" />
    </section>
  );
}
