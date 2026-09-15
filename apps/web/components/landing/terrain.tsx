"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { startHeroModelPreload } from "@/components/landing/sacred-valley-preload";
import {
  detectWebGL,
  prefersReducedMotion,
  readGpuRenderer,
  resolveWorldPresentation,
  type WorldPresentation,
} from "@/components/landing/world-capability";
import {
  isDocumentVisible,
  shouldRunWorldFrameLoop,
} from "@/components/landing/world-loop";
import { subscribePrefersReducedMotion } from "@/components/landing/world-motion";

const TerrainCanvas = dynamic(
  () =>
    import("@/components/landing/terrain-canvas").then(
      (module) => module.TerrainCanvas,
    ),
  { ssr: false },
);

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

/**
 * Capability gate for the drawn valley.
 *
 * Unlike the backdrop this one does fetch — several megabytes of Draco terrain
 * — so it mounts nothing at all until the browser has proved it can draw it,
 * and shows nothing in its place: the hero is composed to stand on the liquid
 * and the type alone if the drawing never arrives.
 */
export function Terrain({ className }: { readonly className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [intersecting, setIntersecting] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [presentation, setPresentation] = useState<WorldPresentation>({
    mode: "fallback",
    reason: "ssr",
  });
  const [contextLost, setContextLost] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  /*
   * Read after mount, never during render. `prefersReducedMotion()` reaches for
   * matchMedia, which the server does not have, so calling it inline makes the
   * markup React renders on the server differ from the markup it renders on the
   * client — a hydration mismatch React reports and then refuses to patch.
   */
  const [fade, setFade] = useState<string | undefined>(undefined);

  useEffect(() => {
    startHeroModelPreload();
    setFade(prefersReducedMotion() ? undefined : "opacity 700ms ease");
  }, []);

  useEffect(() => {
    return subscribePrefersReducedMotion((matches) => {
      setReducedMotion(matches);
      const navigatorWithMemory = navigator as NavigatorWithMemory;
      setPresentation(
        resolveWorldPresentation({
          forceFallback: false,
          gpuRenderer: readGpuRenderer(),
          hasWebGL: detectWebGL(),
          hardwareConcurrency: navigator.hardwareConcurrency,
          deviceMemory: navigatorWithMemory.deviceMemory,
          /*
           * The drawing is still worth showing under reduced motion — it is
           * the page's subject — so it is not withheld here. What the setting
           * turns off is the turn itself, which the canvas handles by parking
           * the camera at its opening bearing.
           */
          prefersReducedMotion: false,
          quality: "auto",
        }),
      );
    });
  }, []);

  useEffect(() => {
    const syncVisibility = () => {
      setDocumentVisible(isDocumentVisible(document.visibilityState));
    };

    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }
        setIntersecting(entry.isIntersecting);
      },
      { threshold: 0.04 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const webglReady = presentation.mode === "webgl" && !contextLost;
  /*
   * Reduced motion keeps the loop alive rather than parking it: the camera
   * stops turning, but the canvas still has to draw the frame it is holding.
   */
  const running = shouldRunWorldFrameLoop({
    intersecting,
    documentVisible,
  });

  return (
    <div
      ref={rootRef}
      className={className}
      data-terrain={drawn ? "drawn" : "pending"}
      style={{ opacity: drawn ? 1 : 0, transition: fade }}
    >
      {webglReady ? (
        <TerrainCanvas
          onContextLost={() => setContextLost(true)}
          onDrawn={() => setDrawn(true)}
          quality={presentation.quality}
          reducedMotion={reducedMotion}
          running={running}
        />
      ) : null}
    </div>
  );
}
