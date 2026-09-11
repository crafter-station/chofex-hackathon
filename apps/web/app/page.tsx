import { LandingApply } from "@/components/landing/apply";
import { LandingFacts } from "@/components/landing/facts";
import { LandingFilter } from "@/components/landing/filter";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader, LandingMobileCta } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingPrizes } from "@/components/landing/prizes";
import { landingPageClassName } from "@/components/landing/shell";
import { LandingSponsors } from "@/components/landing/sponsors";
import { LandingTracks } from "@/components/landing/tracks";
import { LandingWhy } from "@/components/landing/why";

export default function Home() {
  return (
    <div className={landingPageClassName} lang="es">
      <LandingHeader />
      <main id="top">
        <LandingHero />
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
