import {
  BrandContainer,
  BrandSectionHeader,
  brandSectionClassName,
} from "@chofex/ui/components/brand";
import { buttonVariants } from "@chofex/ui/components/button";
import { discordCopy, faqCopy, faqItems } from "@/components/landing/content";

export function LandingFaq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-[var(--hud-paper)]"
      id="faq"
    >
      <BrandContainer className={brandSectionClassName}>
        <BrandSectionHeader title={faqCopy.title} titleId="faq-heading" />
        <div className="border-[var(--hud-ink)]/15 border-t">
          {faqItems.map((item) => (
            <details
              className="group border-[var(--hud-ink)]/15 border-b"
              key={item.question}
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 font-medium sm:min-h-18 sm:py-5 [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="font-mono text-[var(--hud-action)] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-6 text-sm leading-relaxed text-[var(--hud-muted)] sm:text-base">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-6 border-[var(--hud-ink)]/15 border-y py-7 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <h3 className="font-display text-2xl uppercase sm:text-3xl">
              {discordCopy.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--hud-muted)] sm:text-base">
              {discordCopy.description}
            </p>
          </div>
          <a
            className={buttonVariants({
              variant: "outline",
              size: "landing",
              className: "w-full shrink-0 sm:w-auto",
            })}
            href="/discord"
          >
            <span>{discordCopy.cta}</span>
          </a>
        </div>
      </BrandContainer>
    </section>
  );
}
