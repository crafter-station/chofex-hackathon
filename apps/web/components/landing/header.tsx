import { MountainIcon } from "lucide-react";

import {
  LandingContainer,
  landingCtaClassName,
} from "@/components/landing/shell";

export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <LandingContainer className="flex h-16 items-center justify-between gap-3 sm:h-20">
        <a
          className="flex min-w-0 items-center gap-2.5 lowercase tracking-tight"
          href="#top"
        >
          <span className="grid size-8 shrink-0 place-items-center border-2 border-[#e1ff00] text-[#e1ff00]">
            <MountainIcon className="size-4" aria-hidden="true" />
          </span>
          <span className="truncate text-sm font-medium sm:text-base">
            hack the andes
          </span>
        </a>
        <div className="flex shrink-0 items-center gap-4">
          <p className="hidden font-mono text-[10px] tracking-[0.14em] text-[#d1d5d1] uppercase sm:block">
            Sponsored by Chofex
          </p>
          <a
            href="#apply"
            className={`${landingCtaClassName} min-h-10 px-4 py-1.5 text-sm md:min-h-10 md:px-5 md:text-sm`}
          >
            Aplicar
          </a>
        </div>
      </LandingContainer>
    </header>
  );
}

export function LandingMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-[#e1ff00]/25 border-t bg-[#1a1a1a]/95 p-3 backdrop-blur-md sm:hidden">
      <a href="#apply" className={`${landingCtaClassName} w-full min-h-12`}>
        Aplicar
      </a>
    </div>
  );
}
