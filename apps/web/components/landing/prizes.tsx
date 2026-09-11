import { cn } from "@chofex/ui/lib/utils";

import {
  formatSoles,
  prizeAmountsPen,
  prizeAmountsUsd,
  usdToPenRate,
} from "@/components/landing/content";
import {
  LandingContainer,
  LandingEyebrow,
  landingInvertClassName,
} from "@/components/landing/shell";

const places = [
  { place: "1er lugar", amount: prizeAmountsPen.first },
  { place: "2do lugar", amount: prizeAmountsPen.second },
] as const;

export function LandingPrizes() {
  const cashHeadline =
    Math.floor((prizeAmountsPen.first + prizeAmountsPen.second) / 1_000) *
    1_000;

  return (
    <section
      aria-labelledby="prizes-heading"
      className={landingInvertClassName}
    >
      <LandingContainer className="py-16 sm:py-24">
        <div className="grid gap-8 border-current/20 border-b pb-10 md:grid-cols-[1fr_1.4fr]">
          <LandingEyebrow id="prizes-heading">Premios</LandingEyebrow>
          <div className="flex flex-col gap-4">
            <h2 className="max-w-xl text-4xl leading-[0.95] font-medium tracking-[-0.05em] sm:text-6xl">
              Más de {formatSoles(cashHeadline)} en efectivo.
            </h2>
            <p className="max-w-md text-base leading-relaxed opacity-65">
              Premios en soles para que se sientan cerca. Convertidos de USD{" "}
              {prizeAmountsUsd.first.toLocaleString("es-PE")} /{" "}
              {prizeAmountsUsd.second.toLocaleString("es-PE")} al tipo ~S/.{" "}
              {usdToPenRate.toLocaleString("es-PE")}.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2">
          {places.map((item, index) => {
            const isFirst = index === 0;
            const frameClassName = isFirst
              ? "border-current/20 md:border-r md:pr-10"
              : "border-current/20 border-t md:border-t-0 md:pl-10";

            return (
              <article
                className={cn("flex flex-col gap-3 py-10", frameClassName)}
                key={item.place}
              >
                <p className="font-mono text-xs uppercase tracking-[0.16em] opacity-50">
                  {item.place}
                </p>
                <p className="text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
                  {formatSoles(item.amount)}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-current/20 border-t pt-8 text-sm leading-relaxed opacity-60">
          <p>
            Hay un pool extra de ~{formatSoles(prizeAmountsPen.travelPool)} para
            minijuegos y/o viaje de provincia.
          </p>
          <p>
            * Los equipos top podrían ser invitados a un work trial de dos
            semanas en Monterrey o San Francisco. No es una oferta de trabajo.
          </p>
        </div>
      </LandingContainer>
    </section>
  );
}
