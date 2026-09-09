import { buttonVariants } from "@chofex/ui/components/button";
import Link from "next/link";

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
    <main className="min-h-svh bg-background px-6 py-12 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <nav className="mb-10 flex flex-wrap gap-3" aria-label="Legal pages">
          <Link className={buttonVariants({ variant: "outline" })} href="/">
            Chofex Hackathon
          </Link>
          <Link
            className={buttonVariants({ variant: "ghost" })}
            href={alternateHref}
          >
            {alternateLabel}
          </Link>
        </nav>
        <LegalDocument>{children}</LegalDocument>
      </article>
    </main>
  );
}
