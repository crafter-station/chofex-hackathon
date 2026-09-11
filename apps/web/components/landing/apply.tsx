import { CopyAgentPrompt } from "@/components/copy-agent-prompt";
import { cliCommands } from "@/components/landing/content";
import {
  LandingContainer,
  landingFrameClassName,
  LandingSectionHead,
} from "@/components/landing/shell";
import { TerminalIcon } from "lucide-react";

export function LandingApply() {
  return (
    <section className="bg-[#1a1a1a] text-[#e1ff00]" id="apply">
      <LandingContainer className="py-14 sm:py-20">
        <LandingSectionHead title="Aplica ahora">
          <p className="max-w-xl text-sm leading-relaxed text-[#d1d5d1] sm:text-base">
            Aplica con la CLI o dile a tu agent.
          </p>
        </LandingSectionHead>

        <div className="grid gap-3 md:grid-cols-2">
          <article className={`p-5 sm:p-6 ${landingFrameClassName}`}>
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-xs text-[#d1d5d1]">01</span>
              <TerminalIcon
                className="size-5 text-[#d1d5d1]"
                aria-hidden="true"
              />
            </div>
            <h3 className="font-[family-name:var(--font-landing-led)] text-lg tracking-[0.08em] uppercase sm:text-xl">
              Aplica con la CLI
            </h3>
            <div className="mt-6 overflow-x-auto border-2 border-[#e1ff00]/40 bg-black p-5 font-mono text-sm leading-8">
              {cliCommands.map((command) => (
                <div className="whitespace-nowrap" key={command}>
                  <span className="mr-3 text-[#e1ff00]">$</span>
                  {command}
                </div>
              ))}
            </div>
          </article>

          <article className={`p-5 sm:p-6 ${landingFrameClassName}`}>
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-xs text-[#d1d5d1]">02</span>
              <span className="font-mono text-xs tracking-[0.16em] uppercase text-[#d1d5d1]">
                agent
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-landing-led)] text-lg tracking-[0.08em] uppercase sm:text-xl">
              O dile a tu agent
            </h3>
            <CopyAgentPrompt />
          </article>
        </div>
      </LandingContainer>
    </section>
  );
}
