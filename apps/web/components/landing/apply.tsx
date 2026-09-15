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
    <section
      aria-labelledby="apply-heading"
      className="bg-[var(--hud-card)] text-[var(--hud-ink)]"
      id="apply"
    >
      <LandingContainer className="py-20 sm:py-28">
        <HudLabel className="mb-4 text-[var(--hud-action)]">
          {applyCopy.kicker}
        </HudLabel>
        <LandingSectionHead title={applyCopy.title} titleId="apply-heading">
          <div className="max-w-xl">
            <p className="text-lg leading-relaxed text-[var(--hud-ink)]/75">
              {applyCopy.lede}
            </p>
            <div className="mt-7 border-[var(--hud-ink)]/15 border-t pt-5">
              <HudLabel className="mb-4 text-[var(--hud-muted)]">
                {applyCopy.criteriaTitle}
              </HudLabel>
              <ul className="space-y-3">
                {applyCopy.criteria.map((criterion) => (
                  <li
                    className="grid grid-cols-[1rem_1fr] gap-3 text-sm leading-relaxed text-[var(--hud-muted)]"
                    key={criterion}
                  >
                    <span
                      aria-hidden="true"
                      className="text-[var(--hud-action)]"
                    >
                      +
                    </span>
                    {criterion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </LandingSectionHead>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article className={`p-6 ${landingFrameClassName}`}>
            <div className="mb-8 flex items-center justify-between">
              <HudLabel className="text-[var(--hud-action)]">01</HudLabel>
              <TerminalIcon
                aria-hidden="true"
                className="size-5 text-[var(--hud-muted)]"
              />
            </div>
            <h3 className="font-[family-name:var(--font-landing-display)] text-3xl leading-none uppercase">
              {applyCopy.cliTitle}
            </h3>
            <ol className="mt-6 overflow-hidden border border-white/15 bg-black font-[family-name:var(--font-landing-mono)] text-sm text-white">
              {cliCommands.map((command, index) => (
                <li
                  className="grid grid-cols-[2rem_1fr] border-white/10 border-b p-4 last:border-b-0"
                  key={command}
                >
                  <span className="text-[var(--hud-type)]/45">
                    0{index + 1}
                  </span>
                  <code className="overflow-x-auto whitespace-nowrap">
                    <span className="mr-3 text-[var(--hud-accent)]">$</span>
                    {command}
                  </code>
                </li>
              ))}
            </ol>
          </article>

          <article className={`p-6 ${landingFrameClassName}`}>
            <div className="mb-8 flex items-center justify-between">
              <HudLabel className="text-[var(--hud-action)]">02</HudLabel>
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
