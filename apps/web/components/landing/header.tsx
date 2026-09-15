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
  /*
   * The bar stays out of the way until the reader leaves the top of the page.
   *
   * The hero is a poster: a drawing, a name and a date, and a fixed bar across
   * the top of it is a second thing competing for the first look. Once the
   * reader is scrolling it stops being competition and starts being useful, so
   * that is when it arrives.
   */
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();

  useEffect(() => {
    /*
     * A threshold, not `> 0`: a single pixel of rubber-banding or an anchored
     * scroll correction would otherwise flicker the bar in and out.
     */
    const sync = () => setScrolled(window.scrollY > 48);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

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

  // Open menu wins: it is reachable at the very top of the page too, and a bar
  // that slid away under an open menu would take the close button with it.
  const showing = scrolled || open;

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-30 border-white/10 border-b bg-[var(--hud-footer)]/92 text-[var(--hud-type)] backdrop-blur-xl transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
        showing ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
      // Hidden from everything, not just from view: a bar that is off screen
      // but still in the tab order is a keyboard trap at the top of the page.
      inert={showing ? undefined : true}
    >
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
