import { differentiators } from "@/components/landing/content";
import {
  LandingContainer,
  landingFrameClassName,
  LandingSectionHead,
} from "@/components/landing/shell";

export function LandingWhy() {
  return (
    <section aria-labelledby="why-heading" className="bg-[#1a1a1a]">
      <LandingContainer className="py-14 sm:py-16">
        <LandingSectionHead title="Por qué este" titleId="why-heading">
          <p className="text-sm text-[#d1d5d1] lowercase sm:text-base">
            no es otro hackathon.
          </p>
        </LandingSectionHead>
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {differentiators.map((item, index) => {
            const number = String(index + 1).padStart(2, "0");
            return (
              <li
                className={`flex flex-col gap-3 p-5 ${landingFrameClassName}`}
                key={item.title}
              >
                <span className="font-mono text-[11px] text-[#d1d5d1]">
                  {number}
                </span>
                <h3 className="font-[family-name:var(--font-landing-title)] text-sm font-medium tracking-[0.12em] uppercase sm:text-base">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#d1d5d1]">
                  {item.body}
                </p>
              </li>
            );
          })}
        </ol>
      </LandingContainer>
    </section>
  );
}
