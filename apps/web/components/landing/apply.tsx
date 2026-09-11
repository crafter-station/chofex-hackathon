import { CopyAgentPrompt } from "@/components/copy-agent-prompt";
import { cliCommands } from "@/components/landing/content";
import {
  LandingContainer,
  LandingEyebrow,
  LandingTitle,
} from "@/components/landing/shell";
import { TerminalIcon } from "lucide-react";

export function LandingApply() {
  return (
    <section
      className="border-[#e1ff00]/20 border-t bg-[#1a1a1a] text-[#e1ff00]"
      id="apply"
    >
      <LandingContainer className="py-14 sm:py-20">
        <div className="grid gap-5 border-[#e1ff00]/20 border-b pb-8 md:grid-cols-[1fr_1.6fr]">
          <LandingEyebrow>Aplica ahora</LandingEyebrow>
          <LandingTitle className="max-w-3xl normal-case tracking-tight">
            Aplica con la CLI o dile a tu agent.
          </LandingTitle>
        </div>

        <div className="grid gap-px bg-[#e1ff00]/20 md:grid-cols-2">
          <article className="bg-[#1a1a1a] py-8 md:pr-10">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-xs text-[#d1d5d1]">01</span>
              <TerminalIcon
                className="size-5 text-[#d1d5d1]"
                aria-hidden="true"
              />
            </div>
            <h3 className="text-xl font-medium tracking-[0.06em] uppercase sm:text-2xl">
              Aplica con la CLI
            </h3>
            <div className="mt-6 overflow-x-auto border-2 border-[#e1ff00]/30 bg-black/40 p-5 font-mono text-sm leading-8">
              {cliCommands.map((command) => (
                <div className="whitespace-nowrap" key={command}>
                  <span className="mr-3 text-[#e1ff00]">$</span>
                  {command}
                </div>
              ))}
            </div>
          </article>

          <article className="bg-[#1a1a1a] py-8 md:pl-10">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-xs text-[#d1d5d1]">02</span>
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#d1d5d1]">
                Agent
              </span>
            </div>
            <h3 className="text-xl font-medium tracking-[0.06em] uppercase sm:text-2xl">
              O dile a tu agent
            </h3>
            <CopyAgentPrompt />
          </article>
        </div>
      </LandingContainer>
    </section>
  );
}
