import { MountainIcon } from "lucide-react";

import { LandingContainer } from "@/components/landing/shell";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-current/15 border-b bg-[#f4f1e9]/90 backdrop-blur-md dark:bg-[#171713]/90">
      <LandingContainer className="flex h-16 items-center justify-between gap-3">
        <a
          className="flex min-w-0 items-center gap-2.5 font-semibold"
          href="#top"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#171713] text-[#f4f1e9] dark:bg-[#f4f1e9] dark:text-[#171713]">
            <MountainIcon className="size-4" aria-hidden="true" />
          </span>
          <span className="truncate">Hack the Andes</span>
        </a>
        <div className="flex shrink-0 items-center gap-3">
          <p className="hidden text-[11px] tracking-[0.04em] opacity-50 sm:block">
            Sponsored by Chofex
          </p>
          <a
            href="#apply"
            className="inline-flex h-10 items-center rounded-full bg-[#171713] px-4 text-sm font-medium text-[#f4f1e9] dark:bg-[#f4f1e9] dark:text-[#171713]"
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
    <div className="fixed inset-x-0 bottom-0 z-40 border-current/15 border-t bg-[#f4f1e9]/95 p-3 backdrop-blur-md sm:hidden dark:bg-[#171713]/95">
      <a
        href="#apply"
        className="flex h-12 items-center justify-center rounded-full bg-[#171713] text-sm font-medium text-[#f4f1e9] dark:bg-[#f4f1e9] dark:text-[#171713]"
      >
        Aplicar
      </a>
    </div>
  );
}
