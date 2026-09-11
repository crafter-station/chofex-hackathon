import Link from "next/link";

import { LandingContainer } from "@/components/landing/shell";

export function LandingFooter() {
  return (
    <footer className="border-current/15 border-t pb-24 sm:pb-0">
      <LandingContainer className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-medium">Hack the Andes</p>
          <p className="text-sm opacity-50">
            Lima · 10–11 oct 2026 · Sponsored by Chofex
          </p>
        </div>
        <nav aria-label="Legal" className="flex items-center gap-5 text-sm">
          <Link className="underline-offset-4 hover:underline" href="/terms">
            Términos
          </Link>
          <Link className="underline-offset-4 hover:underline" href="/privacy">
            Privacidad
          </Link>
        </nav>
      </LandingContainer>
    </footer>
  );
}
