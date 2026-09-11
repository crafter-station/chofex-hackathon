import { cn } from "@chofex/ui/lib/utils";
import { LandingApply } from "@/components/landing/apply";
import { LandingFacts } from "@/components/landing/facts";
import { LandingFilter } from "@/components/landing/filter";
import { landingDisplay, landingMono } from "@/components/landing/fonts";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader, LandingMobileCta } from "@/components/landing/header";
import { LandingWorld } from "@/components/landing/landing-world";
import { LandingPrizes } from "@/components/landing/prizes";
import { landingPageClassName } from "@/components/landing/shell";
import { LandingSponsors } from "@/components/landing/sponsors";
import { LandingTracks } from "@/components/landing/tracks";
import { LandingWhy } from "@/components/landing/why";

export default function Home() {
  return (
    <div
      className={cn(
        landingPageClassName,
        landingDisplay.variable,
        landingMono.variable,
        landingMono.className,
      )}
      lang="es"
    >
      <LandingHeader />
      <main id="top">
        <LandingWorld />
        <LandingFacts />
        <LandingPrizes />
        <LandingTracks />
        <LandingWhy />
        <LandingFilter />
        <LandingApply />
        <LandingSponsors />
      </main>
      <LandingFooter />
      <LandingMobileCta />
    </div>
  );
}
