import { sponsorSlots, sponsorsCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingSponsors() {
  return (
    <section
      aria-labelledby="sponsors-heading"
      className="bg-[#f5f5f5] text-[#0b0d10]"
    >
      <LandingContainer className="py-16 sm:py-20">
        <HudLabel className="mb-3 text-[#0057ff]">
          {sponsorsCopy.kicker}
        </HudLabel>
        <LandingSectionHead
          title={sponsorsCopy.title}
          titleId="sponsors-heading"
        >
          <p className="max-w-md text-sm leading-relaxed text-[var(--hud-muted-on-light)]">
            {sponsorsCopy.lede}
          </p>
        </LandingSectionHead>
        <ul className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {sponsorSlots.map((slot) => {
            const label = slot.confirmed ? slot.name : "Más sponsors pronto";
            return (
              <li
                className="grid h-28 place-items-center border border-[#0b0d10]/15 bg-white px-3 text-center"
                key={slot.id}
              >
                <span
                  className={
                    slot.confirmed
                      ? "font-[family-name:var(--font-landing-display)] text-3xl tracking-[-0.02em] text-[#0b0d10] uppercase"
                      : "font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.16em] text-[var(--hud-muted-on-light)] uppercase"
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
