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
              <HudLabel className="text-[var(--hud-muted)]">01</HudLabel>
              <TerminalIcon
                aria-hidden="true"
                className="size-5 text-[var(--hud-muted)]"
              />
            </div>
            <h3 className="font-[family-name:var(--font-landing-display)] text-3xl leading-none uppercase">
              {applyCopy.cliTitle}
            </h3>
            <ol className="mt-6 overflow-hidden border border-[var(--hud-ink)]/10 bg-[var(--hud-ink)] font-[family-name:var(--font-landing-mono)] text-sm text-[var(--hud-type)]">
              {cliCommands.map((command, index) => (
                <li
                  /*
                   * `minmax(0, 1fr)`, not `1fr`. A grid track defaults to a
                   * minimum of its own content, so the nowrap command pushed
                   * the track — and the card, and the section — wider than the
                   * screen instead of scrolling inside the `overflow-x` below.
                   * On a phone the commands ran off the right edge, clipped out
                   * of sight by the page's own horizontal clipping.
                   */
                  className="grid grid-cols-[2rem_minmax(0,1fr)] border-white/10 border-b p-4 last:border-b-0"
                  key={command}
                >
                  <span className="text-[var(--hud-type)]/45">
                    0{index + 1}
                  </span>
                  {/*
                   * And it wraps on a phone rather than scrolling sideways: a
                   * command hidden behind a horizontal scrollbar is a command
                   * nobody reads, and these break cleanly at their spaces.
                   */}
                  <code className="min-w-0 break-words whitespace-normal sm:overflow-x-auto sm:whitespace-nowrap">
                    <span className="mr-3 text-[var(--hud-accent)]">$</span>
                    {command}
                  </code>
                </li>
              ))}
            </ol>
          </article>

          <article className={`p-6 ${landingFrameClassName}`}>
            <div className="mb-8 flex items-center justify-between">
              <HudLabel className="text-[var(--hud-muted)]">02</HudLabel>
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
