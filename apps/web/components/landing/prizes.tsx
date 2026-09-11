import {
  formatSoles,
  prizeAmountsPen,
  prizeAmountsUsd,
  usdToPenRate,
} from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import { PrizeCounter } from "@/components/landing/prize-counter";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingPrizes() {
  const cashHeadline =
    Math.floor((prizeAmountsPen.first + prizeAmountsPen.second) / 1_000) *
    1_000;

  return (
    <section
      aria-labelledby="prizes-heading"
      className="bg-[#0057ff] text-[#f5f5f5]"
      id="prizes"
    >
      <LandingContainer className="flex flex-col justify-center gap-12 py-16 md:min-h-dvh md:py-20">
        <LandingSectionHead title="Premios" titleId="prizes-heading">
          <p className="max-w-lg text-sm leading-relaxed text-[#f5f5f5]/80 sm:text-base">
            más de {formatSoles(cashHeadline)} en efectivo. convertidos de USD{" "}
            {prizeAmountsUsd.first.toLocaleString("es-PE")} /{" "}
            {prizeAmountsUsd.second.toLocaleString("es-PE")} al tipo ~S/.{" "}
            {usdToPenRate.toLocaleString("es-PE")}.
          </p>
        </LandingSectionHead>

        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_auto_1fr] lg:items-center">
          <div className="flex flex-col gap-2">
            <HudLabel className="text-[#d6ff00]">pozo de premios</HudLabel>
            <p className="font-[family-name:var(--font-landing-display)] text-[clamp(4.6rem,16vw,10rem)] leading-[0.78] tracking-[-0.03em] text-[#d6ff00]">
              <PrizeCounter amount={prizeAmountsPen.first} format="number" />
            </p>
            <p className="font-[family-name:var(--font-landing-mono)] text-xs tracking-[0.16em] uppercase">
              S/. en 1er lugar
            </p>
            <p className="mt-1 text-sm text-[#f5f5f5]/80">
              2do lugar{" "}
              <span className="font-semibold text-[#d6ff00]">
                <PrizeCounter amount={prizeAmountsPen.second} />
              </span>
            </p>
          </div>

          <p className="hidden font-[family-name:var(--font-landing-display)] text-6xl leading-none text-[#d6ff00] lg:block">
            +
          </p>

          <div className="flex flex-col gap-2 lg:text-right">
            <HudLabel className="text-[#d6ff00] lg:ml-auto">
              viaje / minijuegos
            </HudLabel>
            <p className="font-[family-name:var(--font-landing-display)] text-[clamp(3.4rem,8vw,6rem)] leading-[0.86] tracking-[-0.03em]">
              <PrizeCounter
                amount={prizeAmountsPen.travelPool}
                format="number"
              />
            </p>
            <p className="max-w-md text-sm leading-snug text-[#f5f5f5]/80 sm:text-base lg:ml-auto">
              pool extra de ~{formatSoles(prizeAmountsPen.travelPool)} para
              minijuegos y/o viaje de provincia.
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[#f5f5f5]/70">
          * los equipos top podrían ser invitados a un work trial de dos semanas
          en monterrey o san francisco. no es una oferta de trabajo.
        </p>
      </LandingContainer>
    </section>
  );
}
