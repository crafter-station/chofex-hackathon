import { marqueeSignals } from "@/components/landing/content";
import { HeroScene } from "@/components/landing/hero-scene";
import { LandingMarquee } from "@/components/landing/marquee";
import {
  landingCtaClassName,
  landingLedClassName,
} from "@/components/landing/shell";

export function LandingHero() {
  return (
    <section className="relative min-h-dvh w-full overflow-hidden bg-[#1a1a1a] md:h-dvh">
      <HeroScene />

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#1a1a1a]/70 via-[#1a1a1a]/20 to-[#1a1a1a]/80" />

      <div className="pointer-events-none relative z-20 mx-auto flex min-h-dvh w-full max-w-[1800px] flex-col justify-between px-4 pt-8 pb-8 sm:px-8 md:h-dvh md:pt-10 md:pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <h1 className="landing-hero-title max-w-[14ch] lowercase">
            <span className="block font-[family-name:var(--font-landing-display)] text-[clamp(4.2rem,16vw,13rem)] leading-[0.78] font-light tracking-tighter text-[#e1ff00]">
              hack the
            </span>
            <span className="block font-[family-name:var(--font-landing-display)] text-[clamp(4.2rem,16vw,13rem)] leading-[0.78] font-medium tracking-tighter text-white">
              andes
            </span>
          </h1>

          <a
            className={`pointer-events-auto landing-fade-in mt-2 w-full lg:mt-8 lg:w-auto ${landingCtaClassName}`}
            href="#apply"
          >
            <span>Aplicar ahora</span>
            <span className="mt-0.5 font-mono text-[9px] tracking-[0.08em] text-[#1a1a1a]/70 lowercase md:text-[11px]">
              10–11 oct 2026 · presencial
            </span>
          </a>
        </div>

        <p
          className={`${landingLedClassName} max-w-3xl text-[11px] tracking-[0.16em] text-[#e1ff00] sm:text-sm`}
        >
          hackathon selectivo de IA · lima, perú · 10–11 oct 2026
        </p>

        <div className="flex flex-col gap-5">
          <LandingMarquee>
            {marqueeSignals.map((signal) => (
              <span
                className={`${landingLedClassName} text-[clamp(1.15rem,3.2vw,1.9rem)] text-[#e1ff00]`}
                key={signal}
              >
                {signal}
              </span>
            ))}
          </LandingMarquee>

          <div className="flex items-end justify-between gap-4">
            <p className="font-mono text-[10px] tracking-[0.16em] text-[#d1d5d1] lowercase">
              sponsored by chofex
            </p>
            <a className="pointer-events-auto text-[#e1ff00]" href="#apply">
              <span className="sr-only">Aplicar abajo</span>
              <span
                aria-hidden="true"
                className="landing-bounce-cue block text-3xl leading-none"
              >
                ⌄
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
