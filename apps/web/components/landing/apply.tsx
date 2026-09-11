import { TerminalIcon } from "lucide-react";
import { CopyAgentPrompt } from "@/components/copy-agent-prompt";
import { cliCommands } from "@/components/landing/content";
import {
  LandingContainer,
  LandingSectionHead,
  landingFrameClassName,
} from "@/components/landing/shell";

export function LandingApply() {
  return (
    <section className="bg-[#8d78d6] text-[#fff3e4]" id="apply">
      <LandingContainer className="py-14 sm:py-20">
        <LandingSectionHead title="Aplica ahora">
          <p className="max-w-xl text-sm leading-relaxed text-[#fff3e4]/80 sm:text-base">
            Aplica con la CLI o dile a tu agent.
          </p>
        </LandingSectionHead>

        <div className="grid gap-4 md:grid-cols-2">
          <article className={`p-6 sm:p-7 ${landingFrameClassName}`}>
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xs font-medium tracking-[0.16em] text-[#1f1833]/45 uppercase">
                01
              </span>
              <TerminalIcon
                className="size-5 text-[#1f1833]/45"
                aria-hidden="true"
              />
            </div>
            <h3 className="font-[family-name:var(--font-landing-sans)] text-lg font-semibold sm:text-xl">
              Aplica con la CLI
            </h3>
            <div className="mt-6 overflow-x-auto rounded-2xl bg-[#1f1833] p-5 font-[family-name:var(--font-landing-mono)] text-sm leading-8 text-[#fff3e4]">
              {cliCommands.map((command) => (
                <div className="whitespace-nowrap" key={command}>
                  <span className="mr-3 text-[#f0c3de]">$</span>
                  {command}
                </div>
              ))}
            </div>
          </article>

          <article className={`p-6 sm:p-7 ${landingFrameClassName}`}>
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xs font-medium tracking-[0.16em] text-[#1f1833]/45 uppercase">
                02
              </span>
              <span className="text-xs font-medium tracking-[0.16em] text-[#1f1833]/45 uppercase">
                agent
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-landing-sans)] text-lg font-semibold sm:text-xl">
              O dile a tu agent
            </h3>
            <CopyAgentPrompt />
          </article>
        </div>
      </LandingContainer>
    </section>
  );
}
