"use client";

import Image from "next/image";

import { facts, heroCopy, partners } from "@/components/landing/content";
import { HudLabel } from "@/components/landing/hud";
import { landingCtaClassName } from "@/components/landing/shell";
import { Terrain } from "@/components/landing/terrain";

/**
 * The drawn hero.
 *
 * Composed as a poster rather than as a page: the range across the top, the
 * lockup centred beneath it, and the liquid gathered along the line where the
 * two meet. Nothing to explore and nowhere to fly — the camera is parked, and
 * the one thing the hero asks for is a sideways drag, which turns the range on
 * the spot.
 */
export function LandingHero() {
  return (
    <section className="landing-hero relative w-full" id="world">
      {/*
       * `svh`, never `dvh`.
       *
       * `dvh` is the *dynamic* viewport: on a phone it grows the moment the
       * browser's URL bar collapses and shrinks when it comes back. Sizing the
       * hero in it makes the whole document taller mid-scroll, and everything
       * below the hero moves down with it — which reads, from inside the page,
       * as the content jumping backwards while you are scrolling forwards.
       * Filmed at 60fps it is a 44px jump on the frame where Chrome's bar
       * retracts, and the hero was the only thing on the page still measured
       * this way.
       *
       * `svh` is the small viewport: the height with the browser chrome shown,
       * which never changes. The cost is that once the bar hides, the hero is a
       * bar's height short of the screen and the next section peeks in. That is
       * the trade this unit exists to make.
       */}
      <div className="relative flex min-h-svh flex-col overflow-hidden">
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
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[72%] bg-gradient-to-t from-[#050406]/96 via-[#050406]/40 to-transparent lg:h-[34%] lg:via-[#050406]/58"
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
        {/*
         * An even scrim on phones, and the reason it is even.
         *
         * The copy now spans most of a portrait frame and the range turns under
         * it, so no gradient aimed at one band holds: chasing it moved the
         * failure around the rotation — the lede, then the date, then a claim.
         * The worst background measured under the copy was rgb(146); a quarter
         * of black takes that to 110, which is the floor cream type needs, and
         * costs the drawing a quarter of its brightness rather than flattening
         * it. Landscape keeps the gradients alone, where they do hold.
         */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-[#050406]/42 lg:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_58%_38%_at_50%_49%,rgba(5,4,6,0.93)_0%,rgba(5,4,6,0.68)_46%,transparent_84%)] max-lg:bg-[radial-gradient(ellipse_78%_26%_at_50%_22%,rgba(5,4,6,0.9)_0%,rgba(5,4,6,0.6)_55%,transparent_88%)]"
        />

        {/*
         * Pointer events off, so the drag underneath is available across the
         * whole frame; the CTA and the links switch them back on for
         * themselves.
         */}
        {/*
         * The top padding used to reserve a header's height on every screen.
         * The bar now stays away until the reader scrolls, so at rest there is
         * nothing up there to clear and the hero starts where the frame does.
         */}
        <div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between gap-8 px-5 pt-10 pb-8 sm:px-8 lg:px-10 lg:pt-20">
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
          <div className="flex min-h-[calc(100svh-4.5rem)] flex-col gap-8 lg:contents">
            {/*
             * No hint beside the channel any more. It read "drag to move the
             * range", and the range turns on its own now — an instruction for
             * a gesture that does nothing is worse than no instruction.
             */}
            <HudLabel className="text-[var(--hud-type)]/70">
              {heroCopy.channel}
            </HudLabel>

            {/*
             * Biased upward on a phone rather than centred.
             *
             * Centred, the lockup sat in the lower half with the drawing behind
             * it and a band of nothing above — the whole hero read bottom heavy.
             * A fixed margin above and `auto` below puts it in the upper third
             * and leaves the slack at the foot, where the mountains are.
             *
             * Scoped below lg: at lg the wrapper above is `display: contents`
             * and the desktop column does its own spacing.
             */}
            <div className="flex flex-col items-center gap-6 text-center max-lg:mt-[7vh] max-lg:flex-1 max-lg:justify-between max-lg:gap-0 max-lg:pb-[9vh]">
              {/*
               * The kicker sits inside the lockup's scrim, which is the only
               * reason it can be here. On its own over the drawing it measured
               * 4.3:1 against the brightest contour lines — it is 10px mono, and
               * the foreground is the densest white in the frame.
               */}
              <div className="flex flex-col items-center gap-6 lg:contents">
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
              </div>

              {/*
               * Everything under the lockup travels to the foot of the frame on
               * a phone, spread rather than stacked tight.
               *
               * The lockup wants the upper third and the drawing wants the room
               * under it; packing the date, the lede, the button and the marks
               * directly beneath the title filled that room with type and left
               * the mountains as a strip at the very bottom.
               *
               * So this half takes the rest of the frame and spreads its four
               * parts through it rather than sitting as a block at the foot —
               * moving it down as one piece only traded a void under the title
               * for a void in the middle.
               */}
              <div className="flex flex-col items-center gap-6 max-lg:w-full max-lg:flex-1 max-lg:justify-evenly max-lg:gap-4 lg:contents">
                <p className="font-[family-name:var(--font-landing-mono)] text-sm text-[var(--hud-type)] uppercase tracking-[0.2em] sm:text-base">
                  {heroCopy.meta}
                </p>

                {/*
                 * Three lines, each led by its number.
                 *
                 * As one sentence it wrapped to two ragged lines on a phone and
                 * asked the reader to pull three claims out of a paragraph.
                 * Split, each is a glance, and the figures carry the weight.
                 *
                 * Full strength rather than the 88% it used to be: this is the
                 * run furthest from either scrim, and the dimming cost it the
                 * half stop that kept it under AA while a ridge turned behind.
                 */}
                <ul className="flex flex-col items-center gap-1.5 text-[var(--hud-type)] lg:gap-1">
                  {heroCopy.claims.map((claim) => (
                    <li
                      className="flex items-baseline justify-center gap-2"
                      key={claim.figure}
                    >
                      <span className="font-[family-name:var(--font-landing-brand)] font-semibold text-xl leading-none tracking-[0.012em] sm:text-2xl">
                        {claim.figure}
                      </span>
                      <span className="text-base text-[var(--hud-type)] sm:text-lg lg:text-[var(--hud-type)]/80">
                        {claim.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  className={`pointer-events-auto mt-1 w-full sm:w-auto ${landingCtaClassName}`}
                  href="#apply"
                >
                  {/*
                   * One line. The second read "postulaciones abiertas", which a
                   * button offering to apply already says.
                   */}
                  <span>{heroCopy.cta}</span>
                </a>

                {/*
                 * The partners as marks, not as a line of type.
                 *
                 * Chofex takes the middle and the most width because it is the
                 * principal sponsor; the other two flank it. Sized by height
                 * rather than width — Peru Tech Week's mark is square and the
                 * other two are four times wider than they are tall, so matching
                 * widths would make it tower over both.
                 *
                 * The role each one plays used to be the visible copy here and is
                 * now in the alt text, which is where it still reaches anyone who
                 * cannot see the marks.
                 */}
                <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-12">
                  {partners.map((partner) => (
                    <li key={partner.id}>
                      <Image
                        alt={`${partner.name} · ${partner.role}`}
                        className={[
                          "w-auto",
                          partner.shape === "stacked"
                            ? "h-11 sm:h-12"
                            : "h-6 sm:h-7",
                          // The principal sponsor at full strength; the other two
                          // a step back, so the middle of the row reads first.
                          partner.id === "chofex" ? "sm:h-8" : "opacity-80",
                        ].join(" ")}
                        height={partner.logoHeight}
                        priority
                        src={partner.logoSrc}
                        width={partner.logoWidth}
                      />
                    </li>
                  ))}
                </ul>
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
