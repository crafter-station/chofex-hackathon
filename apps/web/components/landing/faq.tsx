import { faqCopy, faqItems } from "@/components/landing/content";
import {
  LandingContainer,
  LandingSectionHead,
  landingSectionYClassName,
} from "@/components/landing/shell";

export function LandingFaq() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-[var(--hud-paper)]"
      id="faq"
    >
      <LandingContainer className={landingSectionYClassName}>
        <LandingSectionHead title={faqCopy.title} titleId="faq-heading" />
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
                  className="font-[family-name:var(--font-landing-mono)] text-[var(--hud-action)] transition-transform group-open:rotate-45"
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
      </LandingContainer>
    </section>
  );
}
