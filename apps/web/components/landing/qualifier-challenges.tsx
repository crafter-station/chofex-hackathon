import Link from "next/link";

import { qualifierChallengesCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import {
  LandingContainer,
  LandingSectionHead,
  landingCtaClassName,
  landingFrameClassName,
  landingSectionYClassName,
} from "@/components/landing/shell";

export function LandingQualifierChallenges() {
  return (
    <section
      aria-labelledby="qualifier-challenges-heading"
      className="bg-[var(--hud-paper)]"
      id="qualifier-challenges"
    >
      <LandingContainer className={landingSectionYClassName}>
        <LandingSectionHead
          title={qualifierChallengesCopy.title}
          subtitle={qualifierChallengesCopy.subtitle}
          titleId="qualifier-challenges-heading"
        >
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--hud-ink)]/75">
            {qualifierChallengesCopy.lede}
          </p>
        </LandingSectionHead>

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <dl
            className={`grid sm:grid-cols-2 lg:grid-cols-1 ${landingFrameClassName}`}
          >
            <div className="border-[var(--hud-ink)]/10 border-b p-6 sm:border-r sm:border-b-0 lg:border-r-0 lg:border-b">
              <dt>
                <HudLabel className="text-[var(--hud-kicker)]">
                  {qualifierChallengesCopy.tracksLabel}
                </HudLabel>
              </dt>
              <dd className="mt-4 text-sm leading-relaxed text-[var(--hud-muted)]">
                {qualifierChallengesCopy.tracksBody}
              </dd>
            </div>
            <div className="p-6">
              <dt>
                <HudLabel className="text-[var(--hud-status)]">
                  {qualifierChallengesCopy.challengesLabel}
                </HudLabel>
              </dt>
              <dd className="mt-4 text-sm leading-relaxed text-[var(--hud-muted)]">
                {qualifierChallengesCopy.challengesBody}
              </dd>
            </div>
          </dl>

          <article className="hud-box relative overflow-hidden bg-[var(--hud-card)] p-6 sm:p-8">
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 size-40 translate-x-1/3 -translate-y-1/3 rounded-full border border-[var(--hud-status)]/30"
            />
            <HudLabel className="text-[var(--hud-status)]">
              {qualifierChallengesCopy.liveKicker}
            </HudLabel>
            <h3 className="mt-8 max-w-xl font-[family-name:var(--font-landing-display)] text-4xl leading-none uppercase sm:text-5xl">
              {qualifierChallengesCopy.liveTitle}
            </h3>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--hud-ink)]/75">
              {qualifierChallengesCopy.liveBody}
            </p>
            <HudLabel className="mt-6 text-[var(--hud-muted)]">
              {qualifierChallengesCopy.liveMeta}
            </HudLabel>
            <Link
              className={`mt-8 ${landingCtaClassName}`}
              href="/challenges/black-box"
            >
              {qualifierChallengesCopy.liveCta}
            </Link>
          </article>
        </div>
      </LandingContainer>
    </section>
  );
}
