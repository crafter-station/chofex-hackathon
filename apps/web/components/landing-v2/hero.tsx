"use client";

import Image from "next/image";

import { facts, heroCopy, sponsorsCopy } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import { landingCtaClassName } from "@/components/landing/shell";
import { Terrain } from "@/components/landing-v2/terrain";

/**
 * The drawn hero.
 *
 * Composed as a poster rather than as a page: the range across the top, the
 * lockup centred beneath it, and the liquid gathered along the line where the
 * two meet. Nothing to explore and nowhere to fly — the camera is parked, and
 * the one thing the hero asks for is a sideways drag, which turns the range on
 * the spot.
 */
export function LandingHeroV2() {
  return (
    <section className="hero-v2 relative w-full" id="world">
      <div className="relative flex min-h-dvh flex-col overflow-hidden">
        {/*
         * The drawing dissolves into the ground rather than ending at the edge
         * of its box. The reference does the same thing with a pen — the
         * foreground ridges thin out to a few strokes and then to nothing — and
         * a hard cut here reads as a cropped image sitting on the page.
         */}
        {/*
         * Full bleed, and no mask.
         *
         * The drawing spent several iterations boxed into the top 56% and faded
         * out below it, which deleted the one thing the reference leads with: a
         * foreground that sweeps out of the bottom edge of the frame. The black
         * under the type is not a wash — it is the valley floor, drawn with the
         * few widely spaced lines a smooth surface earns.
         */}
        <Terrain className="absolute inset-0" />

        {/*
         * Light washes, and they have to stay light.
         *
         * An opaque veil over the bottom two fifths is the obvious way to seat
         * centred type, and it spent several iterations convincing me the
         * renderer was clipping the foreground: the near ridges were being
         * drawn correctly and painted over by this. The foreground sweeping out
         * of the bottom edge is the thing the reference leads with.
         */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[26%] bg-gradient-to-t from-[#050406]/92 via-[#050406]/38 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-44 bg-gradient-to-b from-[#050406] via-[#050406]/70 to-transparent"
        />
        {/*
         * And one soft ellipse under the lockup.
         *
         * Measured, not decorative: the densest contour lines in the drawing
         * are near-white, and where they pass behind the letterforms the
         * headline falls to 1.3:1 — white type on white line art. A band across
         * the frame would fix it by deleting the mountain; an ellipse sits the
         * letters on ground and leaves the range visible around them.
         */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_58%_38%_at_50%_49%,rgba(5,4,6,0.93)_0%,rgba(5,4,6,0.68)_46%,transparent_84%)]"
        />

        {/*
         * Pointer events off, so the drag underneath is available across the
         * whole frame; the CTA and the links switch them back on for
         * themselves.
         */}
        <div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between gap-8 px-5 pt-20 pb-8 sm:px-8 lg:px-10">
          {/*
           * A phone gets the first screen to itself, up to the sponsor mark.
           *
           * Everything used to share one viewport-height column, and
           * `justify-between` duly squeezed the lockup, the lede, the CTA, the
           * sponsor lockup and four figures into 800px — the opening read as a
           * cramped index card rather than a poster. This holds the top bar and
           * the lockup to a full screen on their own, so the facts fall below
           * the fold.
           *
           * `lg:contents` is what keeps the desktop layout untouched: from lg
           * up this element stops generating a box entirely and its two
           * children land straight back in the column above, spaced exactly as
           * they were.
           */}
          <div className="flex min-h-[calc(100dvh-7rem)] flex-col gap-8 lg:contents">
            <div className="flex items-start justify-between gap-4">
              <HudLabel className="text-[var(--hud-type)]/70">
                {heroCopy.channel}
              </HudLabel>
              <HudLabel className="hidden text-[var(--hud-type)]/60 sm:block">
                {heroCopy.dragHint}
              </HudLabel>
            </div>

            {/*
             * `max-lg:my-auto` centres the lockup in what the top bar leaves on a
             * phone. It is scoped below lg because at lg the wrapper above is
             * `display: contents` and the desktop column does its own spacing.
             */}
            <div className="flex flex-col items-center gap-6 text-center max-lg:my-auto">
              {/*
               * The kicker sits inside the lockup's scrim, which is the only
               * reason it can be here. On its own over the drawing it measured
               * 4.3:1 against the brightest contour lines — it is 10px mono, and
               * the foreground is the densest white in the frame.
               */}
              <p className="landing-type-meta text-[var(--hud-kicker)]">
                {heroCopy.eyebrow}
              </p>

              {/*
               * One line, centred, uppercase — the lockup as it appears on the
               * poster. The two-line ranged-left version belongs to a hero with a
               * column of copy beside it; this one has a mountain above it.
               */}
              <h1
                className={
                  "font-[family-name:var(--font-landing-brand)] font-semibold leading-[0.88] tracking-[0.012em] max-w-[16ch] text-[clamp(2.6rem,8vw,6.8rem)] uppercase"
                }
              >
                {/*
                 * One colour, the way the poster has it. The burnt red measured
                 * 1.1:1 where the brightest contour lines run behind ANDES — and
                 * it was competing with the red the liquid is already glowing
                 * behind the lockup, so the word was reading as a smudge in the
                 * middle of the colour rather than as the accent. The colour in
                 * this hero belongs to the field; the type is white on it.
                 */}
                <span className="text-[var(--hud-type)]">
                  {heroCopy.titleLead} {heroCopy.titleAccent}
                </span>
              </h1>

              <p className="font-[family-name:var(--font-landing-mono)] text-sm text-[var(--hud-type)] uppercase tracking-[0.2em] sm:text-base">
                {heroCopy.meta}
              </p>

              <p className="landing-type-lede max-w-xl text-balance text-[var(--hud-type)]/88">
                {heroCopy.lede}
              </p>

              <a
                className={`pointer-events-auto mt-1 w-full sm:w-auto ${landingCtaClassName}`}
                href="#apply"
              >
                <span>{heroCopy.cta}</span>
                <span className="mt-1 text-[10px] tracking-[0.16em] text-[var(--hud-paper)]/80">
                  {heroCopy.ctaMeta}
                </span>
              </a>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                {/*
                 * No plate behind the mark. The cream box was there because the
                 * only asset to hand was the dark-on-transparent logo, which is
                 * invisible on this page — boxing a sponsor's logo to make it
                 * legible is the thing their brand guide exists to prevent.
                 */}
                <Image
                  alt={sponsorsCopy.mark}
                  className="h-auto w-28"
                  height={sponsorsCopy.logoHeight}
                  priority
                  src={sponsorsCopy.logoSrc}
                  width={sponsorsCopy.logoWidth}
                />
                <div className="landing-type-meta text-left text-[var(--hud-type)]/70">
                  <p>{heroCopy.sponsor}</p>
                  <p className="mt-1">{heroCopy.organizer}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/*
             * The facts strip gets a surface of its own.
             *
             * It is the one block of small type that sits on the foreground
             * ridges, where the lines run brightest, and measured there the
             * labels came back at 1.3:1. Everything else in the hero is display
             * size or sits inside the lockup's scrim.
             */}
            <ul className="grid grid-cols-2 border-[var(--hud-type)]/20 border-y bg-[#050406]/88 lg:grid-cols-4">
              {facts.map((fact) => (
                <li
                  className="border-[var(--hud-type)]/15 border-r px-3 py-3 text-[var(--hud-type)] last:border-r-0"
                  key={fact.label}
                >
                  <HudLabel className="mb-1 text-[var(--hud-type)]/75">
                    {fact.label}
                  </HudLabel>
                  <p className="font-[family-name:var(--font-landing-display)] text-xl leading-none">
                    {fact.value}
                  </p>
                </li>
              ))}
            </ul>

            <a
              className="pointer-events-auto self-center text-[var(--hud-type)]"
              href="#why"
            >
              <span className="sr-only">{heroCopy.skipToWhy}</span>
              <span aria-hidden="true" className="block text-3xl leading-none">
                ⌄
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
