"use client";

import { useEffect, useId, useState } from "react";

import { LandingChapterNav } from "@/components/landing/chapter-nav";
import {
  brandName,
  chromeCopy,
  sectionNav,
} from "@/components/landing/content";
import {
  landingCtaClassName,
  landingHudClassName,
} from "@/components/landing/shell";

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
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <a
          className="pointer-events-auto font-[family-name:var(--font-landing-display)] text-lg tracking-[-0.03em] text-[#d6ff00] sm:text-xl"
          href="#top"
        >
          {brandName}
        </a>

        <nav
          aria-label={chromeCopy.sections}
          className={`pointer-events-auto hidden items-center gap-5 text-[10px] text-[var(--hud-muted)] sm:flex ${landingHudClassName}`}
        >
          {sectionNav.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <button
          aria-controls={menuId}
          aria-expanded={open}
          className={`pointer-events-auto sm:hidden ${landingHudClassName} bg-[#0c2344] px-3 py-2 text-[10px] text-[#d6ff00]`}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          {open ? chromeCopy.close : chromeCopy.menu}
        </button>
      </div>

      {open ? (
        <div
          className="pointer-events-auto mx-4 border border-[#f5f5f5]/20 bg-[#071a34]/95 p-4 shadow-2xl backdrop-blur-md sm:hidden"
          id={menuId}
        >
          <nav
            aria-label={chromeCopy.sections}
            className={`flex flex-col gap-3 text-sm text-[#f5f5f5] ${landingHudClassName}`}
          >
            {sectionNav.map((item) => (
              <a href={item.href} key={item.href} onClick={close}>
                {item.label}
              </a>
            ))}
          </nav>
          <LandingChapterNav
            className={`mt-5 flex flex-wrap gap-3 border-[#f5f5f5]/15 border-t pt-4 text-[10px] text-[var(--hud-muted)] ${landingHudClassName}`}
            onNavigate={close}
          />
        </div>
      ) : null}
    </header>
  );
}

export function LandingMobileCta() {
  const [docked, setDocked] = useState(true);

  useEffect(() => {
    const apply = document.getElementById("apply");
    const footer = document.querySelector("footer");
    if (!apply && !footer) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const blocking = entries.some((entry) => entry.isIntersecting);
        setDocked(!blocking);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    if (apply) {
      observer.observe(apply);
    }
    if (footer) {
      observer.observe(footer);
    }

    return () => observer.disconnect();
  }, []);

  if (!docked) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 sm:hidden">
      <a href="#apply" className={`${landingCtaClassName} min-h-12 w-full`}>
        {chromeCopy.apply}
      </a>
    </div>
  );
}
