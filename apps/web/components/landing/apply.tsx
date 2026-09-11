import { TerminalIcon } from "lucide-react";
import { CopyAgentPrompt } from "@/components/copy-agent-prompt";
import { cliCommands } from "@/components/landing/content";
import {
  LandingContainer,
  LandingEyebrow,
  landingInvertClassName,
} from "@/components/landing/shell";

export function LandingApply() {
  return (
    <section className={landingInvertClassName} id="apply">
      <LandingContainer className="py-20 sm:py-28">
        <div className="grid gap-8 border-current/20 border-b pb-12 md:grid-cols-[1fr_1.5fr]">
          <LandingEyebrow className="text-[#e8ff00]">
            Aplica ahora
          </LandingEyebrow>
          <div>
            <h2 className="max-w-2xl text-4xl leading-tight font-medium tracking-[-0.04em] sm:text-6xl">
              Aplica con la CLI o dile a tu agent.
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2">
          <article className="border-current/20 py-10 md:border-r md:pr-10">
            <div className="mb-10 flex items-center justify-between">
              <span className="font-mono text-xs opacity-50">01</span>
              <TerminalIcon className="size-5 opacity-50" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-medium tracking-tight">
              Aplica con la CLI
            </h3>
            <div className="mt-6 overflow-x-auto rounded-lg border border-white/15 bg-black/20 p-5 font-mono text-sm leading-8 dark:border-black/15 dark:bg-black/5">
              {cliCommands.map((command) => (
                <div className="whitespace-nowrap" key={command}>
                  <span className="mr-3 text-[#e8ff00]">$</span>
                  {command}
                </div>
              ))}
            </div>
          </article>

          <article className="border-current/20 border-t py-10 md:border-t-0 md:pl-10">
            <div className="mb-10 flex items-center justify-between">
              <span className="font-mono text-xs opacity-50">02</span>
              <span className="font-mono text-xs uppercase tracking-[0.16em] opacity-50">
                Agent
              </span>
            </div>
            <h3 className="text-2xl font-medium tracking-tight">
              O dile a tu agent
            </h3>
            <CopyAgentPrompt />
          </article>
        </div>
      </LandingContainer>
    </section>
  );
}
