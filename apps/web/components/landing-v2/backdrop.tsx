"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import {
  detectWebGL,
  prefersReducedMotion,
  readGpuRenderer,
  resolveWorldPresentation,
  type WorldPresentation,
} from "@/components/landing/world-capability";
import { subscribePrefersReducedMotion } from "@/components/landing/world-motion";

const BackdropCanvas = dynamic(
  () =>
    import("@/components/landing-v2/backdrop-canvas").then(
      (module) => module.BackdropCanvas,
    ),
  { ssr: false },
);

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

/**
 * The liquid ground, fixed behind every section.
 *
 * Nothing here waits on a network request — the field is a function, not an
 * asset — so what stands in before the first frame, and for good on hardware
 * that cannot run it, is a pair of CSS radials in the same two colours. A
 * fallback that is merely black reads as a load failure rather than as the same
 * page without the motion.
 */
export function Backdrop() {
  const [presentation, setPresentation] = useState<WorldPresentation>({
    mode: "fallback",
    reason: "ssr",
  });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [painted, setPainted] = useState(false);

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
          prefersReducedMotion: prefersReducedMotion(),
          quality: "auto",
        }),
      );
    });
  }, []);

  const webglReady = presentation.mode === "webgl" && !contextLost;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050406]"
      data-backdrop={webglReady && painted ? "liquid" : "painted"}
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: webglReady && painted ? 0 : 1 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_82%,rgba(184,62,53,.85)_0%,rgba(184,62,53,.22)_32%,transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_96%,rgba(36,89,201,.7)_0%,rgba(36,89,201,.18)_34%,transparent_66%)]" />
      </div>
      {webglReady ? (
        <BackdropCanvas
          onContextLost={() => setContextLost(true)}
          onPainted={() => setPainted(true)}
          quality={presentation.quality}
          reducedMotion={reducedMotion}
        />
      ) : null}
      {/*
       * A scrim over the field, and the page's whole contrast budget in one
       * value. Body copy sits directly on this — there are no cards under most
       * of it — and at full strength the cobalt pole reads 3:1 against the warm
       * white the sections are set in, which is under AA. Held down to a deep
       * glow, every section clears 9:1 and the colour still carries.
       */}
      <div className="absolute inset-0 bg-[#050406]/62" />
    </div>
  );
}
