import {
  BrandFooter,
  BrandKicker,
  BrandWordmark,
} from "@chofex/ui/components/brand";
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
  return (
    <BrandFooter className="landing-footer border-[var(--hud-type)]/12 text-[var(--hud-type)]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <BrandWordmark className="text-2xl text-[var(--hud-type)]">
            {brandName}
          </BrandWordmark>
          <BrandKicker className="text-[var(--hud-type)]/70">
            {footerCopy.meta}
          </BrandKicker>
        </div>
        <nav
          aria-label={chromeCopy.sections}
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
        >
          {sectionNav.map((item) => (
            <a
              className="text-[var(--hud-type)]/70 underline-offset-4 hover:underline"
              href={`${sectionHrefPrefix}${item.href}`}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <nav
        aria-label={footerCopy.legalLabel}
        className="flex flex-wrap items-center gap-5 text-sm"
      >
        <Link
          className="text-[var(--hud-type)]/70 underline-offset-4 hover:underline"
          href="/credits"
        >
          {footerCopy.credits}
        </Link>
        <Link className="underline-offset-4 hover:underline" href="/challenges">
          {footerCopy.ranking}
        </Link>
        <Link className="underline-offset-4 hover:underline" href="/terms">
          {footerCopy.terms}
        </Link>
        <Link className="underline-offset-4 hover:underline" href="/privacy">
          {footerCopy.privacy}
        </Link>
      </nav>
    </BrandFooter>
  );
}
