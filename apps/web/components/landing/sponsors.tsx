import { sponsorSlots } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
  landingFrameClassName,
} from "@/components/landing/shell";

export function LandingSponsors() {
  return (
    <section
      aria-labelledby="sponsors-heading"
      className="bg-[#f5f5f5] text-[#0b0d10]"
    >
      <LandingContainer className="py-16 sm:py-20">
        <HudLabel className="mb-3 text-[#0057ff]">{"sponsors / spec"}</HudLabel>
        <LandingSectionHead title="Sponsors" titleId="sponsors-heading">
          <p className="max-w-md text-sm leading-relaxed text-[#0b0d10]/70">
            Sponsored by Chofex. Identidad propia del evento. Chofex patrocina —
            no pinta la paleta.
          </p>
        </LandingSectionHead>
        <ul className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {sponsorSlots.map((slot) => {
            const label = slot.confirmed ? slot.name : "Más sponsors pronto";
            return (
              <li
                className={`grid h-28 place-items-center px-3 text-center ${landingFrameClassName} border-[#0b0d10]/15 bg-white text-[#0b0d10]`}
                key={slot.id}
              >
                <span
                  className={
                    slot.confirmed
                      ? "font-[family-name:var(--font-landing-display)] text-3xl uppercase tracking-[-0.02em]"
                      : "font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.16em] uppercase text-[#0b0d10]/50"
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
