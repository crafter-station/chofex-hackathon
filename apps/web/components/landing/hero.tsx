import { AndesWireframe } from "@/components/landing/graphics";
import {
  landingCtaClassName,
  landingLedClassName,
} from "@/components/landing/shell";

export function LandingHero() {
  return (
    <section className="relative min-h-dvh w-full overflow-hidden bg-[#1a1a1a] md:h-dvh">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1800px] flex-col items-center justify-between px-4 pt-10 pb-8 sm:px-8 md:h-dvh md:pt-14 md:pb-8">
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

        <div className="flex w-full flex-1 items-center justify-center py-4 md:py-2">
          <AndesWireframe className="h-auto w-full max-h-[46vh] max-w-5xl md:max-h-[52vh]" />
        </div>

        <div className="landing-fade-in flex flex-col items-center gap-3">
          <a href="#apply" className={landingCtaClassName}>
            <span>Aplicar ahora</span>
            <span className="mt-0.5 font-mono text-[9px] tracking-[0.08em] text-[#1a1a1a]/70 lowercase md:text-[11px]">
              10–11 oct 2026 · presencial
            </span>
          </a>
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
      </div>
    </section>
  );
}
