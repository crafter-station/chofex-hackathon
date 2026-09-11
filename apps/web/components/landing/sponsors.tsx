import { sponsorSlots } from "@/components/landing/content";
import {
  LandingContainer,
  landingFrameClassName,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingSponsors() {
  return (
    <section aria-labelledby="sponsors-heading" className="bg-[#1a1a1a]">
      <LandingContainer className="py-14 sm:py-16">
        <LandingSectionHead title="Sponsors" titleId="sponsors-heading">
          <p className="max-w-md text-sm leading-relaxed text-[#d1d5d1]">
            Sponsored by Chofex. Identidad propia del evento. Chofex patrocina —
            no pinta la paleta.
          </p>
        </LandingSectionHead>
        <ul className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
          {sponsorSlots.map((slot) => {
            const label = slot.confirmed ? slot.name : "Más sponsors pronto";
            return (
              <li
                className={`grid h-28 place-items-center px-3 text-center ${landingFrameClassName}`}
                key={slot.id}
              >
                <span
                  className={
                    slot.confirmed
                      ? "font-[family-name:var(--font-landing-led)] text-lg tracking-[0.08em] uppercase"
                      : "font-mono text-xs tracking-[0.12em] text-[#d1d5d1] lowercase"
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
