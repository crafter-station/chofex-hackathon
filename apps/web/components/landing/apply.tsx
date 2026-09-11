import { TerminalIcon } from "lucide-react";
import { CopyAgentPrompt } from "@/components/copy-agent-prompt";
import { applyCopy, cliCommands } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
  landingFrameClassName,
} from "@/components/landing/shell";

export function LandingApply() {
  return (
    <section className="bg-[#0b0d10] text-[#f5f5f5]" id="apply">
      <LandingContainer className="py-16 sm:py-20">
        <HudLabel className="mb-3 text-[#d6ff00]">{applyCopy.kicker}</HudLabel>
        <LandingSectionHead title={applyCopy.title}>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--hud-muted)] sm:text-base">
            {applyCopy.lede}
          </p>
        </LandingSectionHead>

        <div className="grid gap-4 md:grid-cols-2">
          <article className={`p-6 ${landingFrameClassName}`}>
            <div className="mb-8 flex items-center justify-between">
              <HudLabel className="text-[#d6ff00]">01</HudLabel>
              <TerminalIcon
                aria-hidden="true"
                className="size-5 text-[var(--hud-muted)]"
              />
            </div>
            <h3 className="font-[family-name:var(--font-landing-display)] text-3xl leading-none uppercase">
              {applyCopy.cliTitle}
            </h3>
            <div className="hud-box mt-6 overflow-x-auto bg-[#0b0d10] p-5 font-[family-name:var(--font-landing-mono)] text-sm leading-8">
              {cliCommands.map((command) => (
                <div className="whitespace-nowrap" key={command}>
                  <span className="mr-3 text-[#d6ff00]">$</span>
                  {command}
                </div>
              ))}
            </div>
          </article>

          <article className={`p-6 ${landingFrameClassName}`}>
            <div className="mb-8 flex items-center justify-between">
              <HudLabel className="text-[#d6ff00]">02</HudLabel>
              <HudLabel className="text-[var(--hud-muted)]">
                {applyCopy.agentKicker}
              </HudLabel>
            </div>
            <h3 className="font-[family-name:var(--font-landing-display)] text-3xl leading-none uppercase">
              {applyCopy.agentTitle}
            </h3>
            <CopyAgentPrompt />
          </article>
        </div>
      </LandingContainer>
    </section>
  );
}
