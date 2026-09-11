import { marqueeSignals } from "@/components/landing/content";
import { HeroScene } from "@/components/landing/hero-scene";
import { LandingMarquee } from "@/components/landing/marquee";
import {
  landingCtaClassName,
  landingDisplayClassName,
} from "@/components/landing/shell";

export function LandingHero() {
  return (
    <section className="relative min-h-dvh w-full overflow-hidden bg-[#4d8ec8] md:h-dvh">
      <HeroScene />

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#1f1833]/45 via-transparent to-[#1f1833]/55" />

      <div className="pointer-events-none relative z-20 mx-auto flex min-h-dvh w-full max-w-[1800px] flex-col justify-between px-4 pt-8 pb-8 sm:px-8 md:h-dvh md:pt-10 md:pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <h1 className="landing-hero-title max-w-[12ch]">
            <span
              className={`${landingDisplayClassName} block text-[clamp(4.4rem,16vw,13rem)] font-normal`}
            >
              hack the
            </span>
            <span
              className={`${landingDisplayClassName} block text-[clamp(4.4rem,16vw,13rem)] font-normal`}
            >
              andes
            </span>
          </h1>

          <a
            className={`pointer-events-auto landing-fade-in mt-2 w-full lg:mt-10 lg:w-auto ${landingCtaClassName}`}
            href="#apply"
          >
            <span>Aplicar ahora</span>
            <span className="mt-0.5 text-[11px] font-medium tracking-wide text-[#1f1833]/60">
              10–11 oct 2026 · presencial
            </span>
          </a>
        </div>

        <p className="max-w-3xl font-[family-name:var(--font-landing-sans)] text-sm font-medium tracking-wide text-[#fff3e4] sm:text-base">
          hackathon selectivo de IA · lima, perú · 10–11 oct 2026
        </p>

        <div className="flex flex-col gap-5">
          <LandingMarquee>
            {marqueeSignals.map((signal) => (
              <span
                className={`${landingDisplayClassName} text-[clamp(1.4rem,3.4vw,2.4rem)] text-[#fff3e4]`}
                key={signal}
              >
                {signal}
              </span>
            ))}
          </LandingMarquee>

          <div className="flex items-end justify-between gap-4">
            <p className="text-[11px] font-medium tracking-[0.16em] text-[#fff3e4]/80 uppercase">
              sponsored by chofex
            </p>
            <a className="pointer-events-auto text-[#fff3e4]" href="#apply">
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
