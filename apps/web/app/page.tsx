import { cn } from "@chofex/ui/lib/utils";
import { LandingApply } from "@/components/landing/apply";
import {
  landingDisplay,
  landingMono,
  landingSans,
} from "@/components/landing/fonts";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader, LandingMobileCta } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingJudges } from "@/components/landing/judges";
import { LandingPrizes } from "@/components/landing/prizes";
import { LandingScan } from "@/components/landing/scan";
import { landingPageClassName } from "@/components/landing/shell";
import { LandingSponsors } from "@/components/landing/sponsors";

export default function Home() {
  return (
    <div
      className={cn(
        landingPageClassName,
        landingDisplay.variable,
        landingSans.variable,
        landingMono.variable,
        landingSans.className,
      )}
      lang="es"
    >
      <LandingHeader />
      <main id="top">
        <LandingHero />
        <LandingJudges />
        <LandingScan />
        <LandingPrizes />
        <LandingApply />
        <LandingSponsors />
      </main>
      <LandingFooter />
      <LandingMobileCta />
    </div>
  );
}
