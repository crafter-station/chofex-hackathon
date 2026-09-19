import {
  BrandFooter,
  BrandKicker,
  BrandWordmark,
} from "@chofex/ui/components/brand";
import { buttonVariants } from "@chofex/ui/components/button";
import Link from "next/link";

import {
  brandName,
  chromeCopy,
  footerCopy,
  sectionNav,
} from "@/components/landing/content";

export function LandingFooter({
  sectionHrefPrefix = "",
}: {
  readonly sectionHrefPrefix?: string;
}) {
  const applyHref = `${sectionHrefPrefix}#apply`;

  return (
    <BrandFooter className="landing-footer border-[var(--hud-type)]/15 bg-[#08070a] text-[var(--hud-type)]">
      <div className="grid gap-10 border-[var(--hud-type)]/15 border-b pb-10 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.58fr)] md:items-end">
        <div>
          <BrandKicker className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--hud-accent)]">
            <span>{footerCopy.eyebrow}</span>
            <span aria-hidden="true" className="text-[var(--hud-type)]/35">
              /
            </span>
            <span>{footerCopy.meta}</span>
          </BrandKicker>
          <BrandWordmark className="text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.9] text-[var(--hud-type)]">
            {brandName}
          </BrandWordmark>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--hud-type)]/65 sm:text-base">
            {footerCopy.tagline}
          </p>
        </div>

        <div className="border-[var(--hud-type)]/15 border-l pl-5 sm:pl-7">
          <p className="font-display text-2xl uppercase sm:text-3xl">
            {footerCopy.ctaTitle}
          </p>
          <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-52 text-sm leading-relaxed text-[var(--hud-type)]/60">
              {footerCopy.ctaDescription}
            </p>
            <a
              className={buttonVariants({
                size: "lg",
                className: "w-full sm:w-auto",
              })}
              href={applyHref}
            >
              {footerCopy.cta}
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-10 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.4fr)]">
        <nav
          aria-label={chromeCopy.sections}
          className="grid gap-5 sm:grid-cols-[8rem_1fr]"
        >
          <BrandKicker className="text-[var(--hud-accent)]">
            {footerCopy.sectionsLabel}
          </BrandKicker>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            {sectionNav.map((item) => (
              <li key={item.href}>
                <a
                  className="text-[var(--hud-type)]/65 underline-offset-4 transition-colors hover:text-[var(--hud-type)] hover:underline"
                  href={`${sectionHrefPrefix}${item.href}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav
          aria-label={footerCopy.informationLabel}
          className="grid gap-5 sm:grid-cols-[8rem_1fr] lg:grid-cols-1"
        >
          <BrandKicker className="text-[var(--hud-accent)]">
            {footerCopy.informationLabel}
          </BrandKicker>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <li>
              <Link
                className="text-[var(--hud-type)]/65 underline-offset-4 transition-colors hover:text-[var(--hud-type)] hover:underline"
                href="/discord"
              >
                {footerCopy.community}
              </Link>
            </li>
            <li>
              <Link
                className="text-[var(--hud-type)]/65 underline-offset-4 transition-colors hover:text-[var(--hud-type)] hover:underline"
                href="/credits"
              >
                {footerCopy.credits}
              </Link>
            </li>
            <li>
              <Link
                className="text-[var(--hud-type)]/65 underline-offset-4 transition-colors hover:text-[var(--hud-type)] hover:underline"
                href="/terms"
              >
                {footerCopy.terms}
              </Link>
            </li>
            <li>
              <Link
                className="text-[var(--hud-type)]/65 underline-offset-4 transition-colors hover:text-[var(--hud-type)] hover:underline"
                href="/privacy"
              >
                {footerCopy.privacy}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-2 border-[var(--hud-type)]/15 border-t pt-6 font-mono text-[0.68rem] text-[var(--hud-type)]/60 uppercase tracking-[0.1em] sm:flex-row sm:items-center sm:justify-between">
        <p>{footerCopy.copyright}</p>
        <a
          className="underline-offset-4 transition-colors hover:text-[var(--hud-type)] hover:underline"
          href="https://crafter.run"
          rel="noreferrer"
          target="_blank"
        >
          {footerCopy.organizer}
        </a>
      </div>
    </BrandFooter>
  );
}
