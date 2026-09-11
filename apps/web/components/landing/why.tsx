import { differentiators } from "@/components/landing/content";
import {
  LandingContainer,
  LandingEyebrow,
  LandingTitle,
} from "@/components/landing/shell";

export function LandingWhy() {
  return (
    <section
      aria-labelledby="why-heading"
      className="border-[#e1ff00]/20 border-t"
    >
      <LandingContainer className="py-12 sm:py-16">
        <div className="grid gap-5 border-[#e1ff00]/20 border-b pb-8 md:grid-cols-[1fr_1.6fr]">
          <LandingEyebrow id="why-heading">Por qué este</LandingEyebrow>
          <LandingTitle>No es otro hackathon.</LandingTitle>
        </div>
        <ol className="grid gap-px bg-[#e1ff00]/20 sm:grid-cols-2">
          {differentiators.map((item, index) => {
            const number = String(index + 1).padStart(2, "0");
            return (
              <li
                className="flex flex-col gap-3 bg-[#1a1a1a] p-5 sm:p-6"
                key={item.title}
              >
                <span className="font-mono text-[11px] tracking-[0.16em] text-[#d1d5d1]">
                  {number}
                </span>
                <h3 className="text-lg font-medium tracking-[0.06em] uppercase sm:text-xl">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#d1d5d1] sm:text-base">
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
