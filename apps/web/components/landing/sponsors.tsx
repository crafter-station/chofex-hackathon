import {
  BrandContainer,
  BrandKicker,
  brandSectionClassName,
} from "@chofex/ui/components/brand";
import Image from "next/image";
import { partners, sponsorsCopy } from "@/components/landing/content";

export function LandingSponsors() {
  return (
    <section
      aria-labelledby="sponsors-heading"
      className="bg-[var(--hud-card)] text-[var(--hud-ink)]"
      id="sponsors"
    >
      <BrandContainer className={brandSectionClassName}>
        <h2 className="sr-only" id="sponsors-heading">
          {sponsorsCopy.kicker}
        </h2>
        <p className="mb-10 max-w-md text-base leading-relaxed text-[var(--hud-muted)]">
          {sponsorsCopy.lede}
        </p>
        {/*
         * Named here, unlike in the hero. This is the section a reader comes to
         * for exactly this, so the role each partner plays is visible copy
         * rather than alt text, and every mark is a link to whoever it belongs
         * to.
         */}
        <ul className="grid gap-px border-[var(--hud-ink)]/15 border-y bg-[var(--hud-ink)]/10 sm:grid-cols-3">
          {partners.map((partner) => (
            <li className="bg-[var(--hud-paper)]" key={partner.id}>
              <a
                className="flex h-full flex-col justify-between gap-8 p-6 transition-opacity hover:opacity-80 sm:p-8"
                href={partner.href}
                rel="noreferrer"
                target="_blank"
              >
                <BrandKicker className="text-[var(--hud-ink)]/60">
                  {partner.role}
                </BrandKicker>
                {/*
                 * `self-start` matters: this is a flex column, and a stretched
                 * item would have the mark filling the card's width with its
                 * height pinned — which squashes a square lockup into a smear.
                 */}
                <Image
                  alt={partner.name}
                  className={`w-auto self-start ${
                    partner.shape === "stacked" ? "h-16" : "h-9 sm:h-10"
                  }`}
                  height={partner.logoHeight}
                  src={partner.logoSrc}
                  width={partner.logoWidth}
                />
              </a>
            </li>
          ))}
        </ul>
      </BrandContainer>
    </section>
  );
}
