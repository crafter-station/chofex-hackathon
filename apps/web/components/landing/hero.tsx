import { AndesWireframe } from "@/components/landing/graphics";
import {
  LandingContainer,
  landingCtaClassName,
} from "@/components/landing/shell";

export function LandingHero() {
  return (
    <section className="relative min-h-dvh w-full overflow-hidden bg-[#1a1a1a] md:h-dvh">
      <LandingContainer className="relative flex min-h-dvh flex-col items-center justify-between pt-10 pb-8 md:h-dvh md:pt-14 md:pb-10">
        <h1 className="px-2 text-center lowercase tracking-tighter">
          <span className="block font-[family-name:var(--font-landing-display)] text-[clamp(2.8rem,12vw,8rem)] leading-[0.85] font-light">
            hack the <span className="font-medium">[andes]</span>
          </span>
          <span className="mt-3 block font-[family-name:var(--font-landing-title)] text-[11px] tracking-[0.22em] uppercase sm:text-sm md:text-base">
            hackathon selectivo de IA · Lima, Perú —{" "}
            <strong className="font-medium">10–11 oct 2026</strong>
          </span>
        </h1>

        <div className="flex w-full max-w-lg flex-1 items-center justify-center py-6 md:max-w-xl">
          <AndesWireframe className="h-auto w-full max-h-[38vh]" />
        </div>

        <div className="landing-fade-in flex flex-col items-center gap-4">
          <a href="#apply" className={landingCtaClassName}>
            <span>Aplicar ahora</span>
            <span className="mt-0.5 font-mono text-[9px] tracking-[0.08em] text-[#1a1a1a]/70 lowercase md:text-[11px]">
              10–11 oct 2026 · presencial
            </span>
          </a>
          <p className="font-mono text-[10px] tracking-[0.14em] text-[#d1d5d1] lowercase">
            sponsored by chofex
          </p>
          <a className="text-[#e1ff00]" href="#apply">
            <span className="sr-only">Aplicar abajo</span>
            <span
              aria-hidden="true"
              className="landing-bounce-cue block text-3xl leading-none"
            >
              ⌄
            </span>
          </a>
        </div>
      </LandingContainer>
    </section>
  );
}
