import { differentiators } from "@/components/landing/content";
import {
  LandingContainer,
  LandingSectionHead,
  landingFrameClassName,
} from "@/components/landing/shell";

export function LandingWhy() {
  return (
    <section
      aria-labelledby="why-heading"
      className="bg-[#b9a8f4] text-[#fff3e4]"
    >
      <LandingContainer className="py-14 sm:py-16">
        <LandingSectionHead title="Por qué este" titleId="why-heading">
          <p className="text-sm text-[#fff3e4]/80 sm:text-base">
            no es otro hackathon.
          </p>
        </LandingSectionHead>
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {differentiators.map((item, index) => {
            const number = String(index + 1).padStart(2, "0");
            return (
              <li
                className={`flex flex-col gap-3 p-6 ${landingFrameClassName}`}
                key={item.title}
              >
                <span className="text-[11px] font-medium tracking-[0.16em] text-[#1f1833]/45 uppercase">
                  {number}
                </span>
                <h3 className="font-[family-name:var(--font-landing-sans)] text-base font-semibold sm:text-lg">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#1f1833]/70">
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
