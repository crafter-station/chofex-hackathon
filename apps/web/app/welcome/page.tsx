import {
  BrandCenteredPage,
  BrandFrame,
  BrandKicker,
  BrandTitle,
} from "@chofex/ui/components/brand";
import { buttonVariants } from "@chofex/ui/components/button";
import type { Metadata } from "next";
import Link from "next/link";

import { brandName } from "@/components/landing/content";

export const metadata: Metadata = {
  title: `Welcome | ${brandName}`,
};

export default function WelcomePage() {
  return (
    <BrandCenteredPage contentClassName="max-w-2xl text-center">
      <BrandFrame className="hud-box flex flex-col items-center px-6 py-12 sm:px-12 sm:py-16">
        <BrandKicker className="text-primary">
          Acceso confirmado / 2026
        </BrandKicker>
        <BrandTitle as="h1" className="mt-6" size="page">
          Happy to have you here
        </BrandTitle>
        <p className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
          You’re inside the {brandName} participant portal. Return to the event
          site for challenges, schedules, and application guidance.
        </p>
        <Link
          className={buttonVariants({ size: "landing", className: "mt-8" })}
          href="/"
        >
          Go home
        </Link>
      </BrandFrame>
    </BrandCenteredPage>
  );
}
