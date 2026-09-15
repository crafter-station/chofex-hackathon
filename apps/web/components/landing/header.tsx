"use client";

import { useEffect, useId, useState } from "react";

import {
  brandName,
  chromeCopy,
  sectionNav,
} from "@/components/landing/content";
import { landingHudClassName } from "@/components/landing/shell";

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 border-white/10 border-b bg-[var(--hud-footer)]/92 text-[var(--hud-type)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <a
          className="pointer-events-auto font-[family-name:var(--font-landing-brand)] font-medium text-lg tracking-[0.012em] text-[var(--hud-type)] transition-colors hover:text-white sm:text-xl"
          href="#top"
        >
          {brandName}
        </a>

        <nav
          aria-label={chromeCopy.sections}
          className={`pointer-events-auto hidden items-center gap-4 text-xs text-[var(--hud-type)]/70 md:flex ${landingHudClassName}`}
        >
          {sectionNav.map((item) => (
            <a
              className="transition-colors hover:text-[var(--hud-type)]"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          aria-controls={menuId}
          aria-expanded={open}
          className={`pointer-events-auto md:hidden ${landingHudClassName} border border-[var(--hud-type)]/20 px-3 py-2 text-[10px] text-[var(--hud-type)]`}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {open ? chromeCopy.close : chromeCopy.menu}
        </button>
      </div>

      {open ? (
        <div
          className="pointer-events-auto border-white/10 border-t bg-[var(--hud-footer)] px-4 py-5 md:hidden"
          id={menuId}
        >
          <nav
            aria-label={chromeCopy.sections}
            className={`flex flex-col gap-4 text-sm text-[var(--hud-type)] ${landingHudClassName}`}
          >
            {sectionNav.map((item) => (
              <a href={item.href} key={item.href} onClick={close}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
