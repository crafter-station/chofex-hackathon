import { sponsorSlots } from "@/components/landing/content";
import {
  LandingContainer,
  LandingEyebrow,
  LandingTitle,
} from "@/components/landing/shell";

export function LandingSponsors() {
  return (
    <section
      aria-labelledby="sponsors-heading"
      className="border-[#e1ff00]/20 border-t"
    >
      <LandingContainer className="py-12 sm:py-16">
        <div className="flex flex-col gap-3">
          <LandingEyebrow id="sponsors-heading">Sponsors</LandingEyebrow>
          <LandingTitle className="normal-case tracking-tight">
            Sponsored by Chofex
          </LandingTitle>
          <p className="max-w-md text-sm leading-relaxed text-[#d1d5d1]">
            Identidad propia del evento. Chofex patrocina — no pinta la paleta.
            Más logos cuando estén confirmados.
          </p>
        </div>
        <ul className="mt-8 grid gap-px bg-[#e1ff00]/20 sm:grid-cols-2">
          {sponsorSlots.map((slot) => {
            const label = slot.confirmed ? slot.name : "Más sponsors pronto";
            return (
              <li
                className="grid h-28 place-items-center border border-[#e1ff00]/20 bg-[#1a1a1a] px-3 text-center"
                key={slot.id}
              >
                <span
                  className={
                    slot.confirmed
                      ? "text-lg font-semibold tracking-[0.08em] uppercase"
                      : "font-mono text-xs tracking-[0.16em] text-[#d1d5d1] uppercase"
                  }
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </LandingContainer>
    </section>
  );
}
