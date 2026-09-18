import {
  BrandContainer,
  BrandHeader,
  BrandPage,
  BrandWordmark,
} from "@chofex/ui/components/brand";
import { buttonVariants } from "@chofex/ui/components/button";
import Link from "next/link";
import { brandName } from "@/components/landing/content";
import { LandingFooter } from "@/components/landing/footer";
import { LegalDocument } from "@/components/legal-document";

interface LegalPageProps {
  readonly children: string;
  readonly alternateHref: string;
  readonly alternateLabel: string;
}

export function LegalPage({
  children,
  alternateHref,
  alternateLabel,
}: LegalPageProps) {
  return (
    <BrandPage className="flex flex-col">
      <BrandHeader>
        <BrandWordmark>
          <Link className="text-inherit" href="/">
            {brandName}
          </Link>
        </BrandWordmark>
        <nav className="flex flex-wrap gap-2" aria-label="Legal pages">
          <Link className={buttonVariants({ variant: "outline" })} href="/">
            Inicio
          </Link>
          <Link
            className={buttonVariants({ variant: "ghost" })}
            href={alternateHref}
          >
            {alternateLabel}
          </Link>
        </nav>
      </BrandHeader>
      <main className="flex-1">
        <BrandContainer className="py-14 sm:py-20">
          <article className="max-w-3xl">
            <LegalDocument>{children}</LegalDocument>
          </article>
        </BrandContainer>
      </main>
      <LandingFooter sectionHrefPrefix="/" />
    </BrandPage>
  );
}
