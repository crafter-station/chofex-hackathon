import {
  BrandCenteredPage,
  BrandFrame,
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
        <BrandTitle as="h1">Happy to have you here</BrandTitle>
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
