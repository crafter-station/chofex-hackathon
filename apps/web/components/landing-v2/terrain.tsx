"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { startHeroModelPreload } from "@/components/landing/sacred-valley-preload";
import {
  detectWebGL,
  prefersReducedMotion,
  readGpuRenderer,
  resolveWorldPresentation,
  type WorldPresentation,
} from "@/components/landing/world-capability";
import { subscribePrefersReducedMotion } from "@/components/landing/world-motion";

const TerrainCanvas = dynamic(
  () =>
    import("@/components/landing-v2/terrain-canvas").then(
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
  const [presentation, setPresentation] = useState<WorldPresentation>({
    mode: "fallback",
    reason: "ssr",
  });
  const [contextLost, setContextLost] = useState(false);
  const [drawn, setDrawn] = useState(false);
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
    return subscribePrefersReducedMotion(() => {
      const navigatorWithMemory = navigator as NavigatorWithMemory;
      setPresentation(
        resolveWorldPresentation({
          forceFallback: false,
          gpuRenderer: readGpuRenderer(),
          hasWebGL: detectWebGL(),
          hardwareConcurrency: navigator.hardwareConcurrency,
          deviceMemory: navigatorWithMemory.deviceMemory,
          // The drawing has no motion of its own: it is parked until the reader
          // drags it, so reduced motion is no reason to withhold it.
          prefersReducedMotion: false,
          quality: "auto",
        }),
      );
    });
  }, []);

  const webglReady = presentation.mode === "webgl" && !contextLost;

  return (
    <div
      className={className}
      data-terrain={drawn ? "drawn" : "pending"}
      style={{ opacity: drawn ? 1 : 0, transition: fade }}
    >
      {webglReady ? (
        <TerrainCanvas
          onContextLost={() => setContextLost(true)}
          onDrawn={() => setDrawn(true)}
          quality={presentation.quality}
        />
      ) : null}
    </div>
  );
}
