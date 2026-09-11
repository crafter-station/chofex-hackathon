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

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#1a1a1a]/80 via-transparent to-[#1a1a1a]/85" />

      <div className="pointer-events-none relative z-20 mx-auto flex min-h-dvh w-full max-w-[1800px] flex-col items-center justify-between px-4 pt-10 pb-8 sm:px-8 md:h-dvh md:pt-14 md:pb-8">
        <h1 className="px-2 text-center lowercase">
          <span className="block font-[family-name:var(--font-landing-display)] text-[clamp(2.6rem,11vw,7.4rem)] leading-[0.86] font-light tracking-tighter">
            hack the <span className="font-medium">[andes]</span>
          </span>
          <span
            className={`${landingLedClassName} mt-4 block text-[10px] tracking-[0.18em] sm:text-xs md:text-sm`}
          >
            hackathon selectivo de IA · lima, perú — 10–11 oct 2026
          </span>
        </h1>

        <div className="w-full max-w-5xl">
          <LandingMarquee>
            {marqueeSignals.map((signal) => (
              <span
                className={`${landingLedClassName} text-[clamp(1.1rem,3.4vw,2rem)] text-[#e1ff00]`}
                key={signal}
              >
                {signal}
              </span>
            ))}
          </LandingMarquee>
        </div>

        <div className="landing-fade-in flex flex-col items-center gap-3">
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#d1d5d1] lowercase">
            sponsored by chofex
          </p>
          <a
            className={`pointer-events-auto ${landingCtaClassName}`}
            href="#apply"
          >
            <span>Aplicar ahora</span>
            <span className="mt-0.5 font-mono text-[9px] tracking-[0.08em] text-[#1a1a1a]/70 lowercase md:text-[11px]">
              10–11 oct 2026 · presencial
            </span>
          </a>
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
    </section>
  );
}
