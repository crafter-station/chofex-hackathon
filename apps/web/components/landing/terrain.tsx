"use client";

import { useEffect, useRef, useState } from "react";

import { HeroPoster } from "@/components/landing/hero-poster";
import {
  scheduleWhenIdle,
  startHeroModelPreload,
} from "@/components/landing/sacred-valley-preload";
import { TerrainFallback } from "@/components/landing/terrain-fallback";
import {
  detectWebGL,
  prefersReducedMotion,
  readGpuRenderer,
  readNetworkConstraint,
  resolveWorldPresentation,
  type WorldPresentation,
} from "@/components/landing/world-capability";
import {
  isDocumentVisible,
  shouldRunWorldFrameLoop,
} from "@/components/landing/world-loop";
import { subscribePrefersReducedMotion } from "@/components/landing/world-motion";

type TerrainCanvasComponent =
  typeof import("@/components/landing/terrain-canvas").TerrainCanvas;

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

/**
 * Capability gate for the drawn valley.
 *
 * The mesh is several megabytes of Draco terrain plus the R3F stack, so
 * nothing in that path starts until the browser has proved it can draw it
 * *and* the opening paint has been given a turn. Until then — and for good on
 * hardware that should not run it — the poster holds the same vantage, with
 * the inline contour SVG behind it if the still has not arrived.
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
  const [Canvas, setCanvas] = useState<TerrainCanvasComponent | null>(null);
  /*
   * Read after mount, never during render. `prefersReducedMotion()` reaches for
   * matchMedia, which the server does not have, so calling it inline makes the
   * markup React renders on the server differ from the markup it renders on the
   * client — a hydration mismatch React reports and then refuses to patch.
   */
  const [fade, setFade] = useState<string | undefined>(undefined);

  useEffect(() => {
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
          network: readNetworkConstraint(),
          prefersReducedMotion: matches,
          quality: "auto",
        }),
      );
    });
  }, []);

  useEffect(() => {
    if (presentation.mode !== "webgl") {
      return;
    }

    return scheduleWhenIdle(() => {
      startHeroModelPreload();
      void import("@/components/landing/terrain-canvas").then((module) => {
        module.preloadHeroTerrain();
        setCanvas(() => module.TerrainCanvas);
      });
    });
  }, [presentation.mode]);

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
  const showCanvas = webglReady && Canvas !== null;
  /*
   * Park the loop off-screen, in a hidden tab, and under reduced motion.
   * Reduced motion never mounts the canvas (the poster holds the frame), so
   * this only applies if the preference flips after a live scene has started.
   */
  const running = shouldRunWorldFrameLoop({
    intersecting,
    documentVisible,
    reducedMotion,
  });

  let terrainState = "poster";
  if (drawn && showCanvas) {
    terrainState = "drawn";
  } else if (showCanvas) {
    terrainState = "pending";
  }

  const fallbackReady = drawn && showCanvas;
  const fallbackClassName = fallbackReady
    ? "landing-world-fallback landing-world-fallback--ready absolute inset-0 text-[var(--hud-type)]"
    : "landing-world-fallback absolute inset-0 text-[var(--hud-type)]";

  return (
    <div
      ref={rootRef}
      className={className}
      data-hero-fallback={
        presentation.mode === "fallback" ? presentation.reason : undefined
      }
      data-terrain={terrainState}
    >
      <div
        aria-hidden="true"
        className={fallbackClassName}
        style={{
          opacity: fallbackReady ? 0 : 1,
          transition: fade,
        }}
      >
        <TerrainFallback className="absolute inset-0 size-full" />
        <HeroPoster />
      </div>
      {showCanvas ? (
        <div
          className="absolute inset-0"
          style={{ opacity: drawn ? 1 : 0, transition: fade }}
        >
          <Canvas
            onContextLost={() => {
              setContextLost(true);
              setDrawn(false);
            }}
            onDrawn={() => setDrawn(true)}
            quality={presentation.quality}
            reducedMotion={reducedMotion}
            running={running}
          />
        </div>
      ) : null}
    </div>
  );
}
