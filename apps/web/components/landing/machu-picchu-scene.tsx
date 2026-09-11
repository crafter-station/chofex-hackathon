"use client";

import { cn } from "@chofex/ui/lib/utils";
import dynamic from "next/dynamic";
import { type MutableRefObject, useEffect, useRef, useState } from "react";

import type { ProjectedTarget } from "@/components/landing/machu-picchu-geometry";
import { startHeroModelPreload } from "@/components/landing/machu-picchu-preload";
import {
  detectWebGL,
  prefersReducedMotion,
  readGpuRenderer,
  resolveWorldPresentation,
  type WorldPresentation,
  type WorldQuality,
} from "@/components/landing/world-capability";
import {
  isDocumentVisible,
  shouldRunWorldFrameLoop,
} from "@/components/landing/world-loop";
import { subscribePrefersReducedMotion } from "@/components/landing/world-motion";
import { paintedFallbackClassName } from "@/components/landing/world-reveal";

const MachuPicchuCanvas = dynamic(
  () =>
    import("@/components/landing/machu-picchu-canvas").then(
      (module) => module.MachuPicchuCanvas,
    ),
  { ssr: false },
);

export type MachuPicchuSceneProps = {
  readonly className?: string;
  readonly quality?: WorldQuality;
  readonly forceFallback?: boolean;
  readonly progressRef: MutableRefObject<number>;
  readonly onTargets?: (targets: ProjectedTarget[]) => void;
};

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

function detectPresentation(
  quality: WorldQuality,
  forceFallback: boolean,
): WorldPresentation {
  const navigatorWithMemory = navigator as NavigatorWithMemory;
  return resolveWorldPresentation({
    forceFallback,
    gpuRenderer: readGpuRenderer(),
    hasWebGL: detectWebGL(),
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigatorWithMemory.deviceMemory,
    prefersReducedMotion: prefersReducedMotion(),
    quality,
  });
}

export function MachuPicchuFallback({
  className,
}: {
  readonly className?: string;
}) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden bg-[#3f83c9]", className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_12%,#bfe4f7_0%,#5598c9_35%,#173c52_72%,#07152b_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(115deg,transparent_0_48%,rgba(255,255,255,.18)_49%,transparent_50%)] [background-size:42px_42px]" />
    </div>
  );
}

/**
 * Sacred Valley WebGL mount for `HeroScene`.
 *
 * Overlay contract:
 * - Render as children of `#hero-scene`
 * - Look layer accepts constrained drag; CTAs keep their own hit targets
 * - Landing type / CTAs stay in the scroll overlays
 * - Painted fallback stays until the citadel GLB is on a presented frame
 */
export function MachuPicchuScene({
  className,
  quality = "auto",
  forceFallback = false,
  progressRef,
  onTargets,
}: MachuPicchuSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [presentation, setPresentation] = useState<WorldPresentation>({
    mode: "fallback",
    reason: "ssr",
  });
  const [intersecting, setIntersecting] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [worldReady, setWorldReady] = useState(false);

  useEffect(() => {
    startHeroModelPreload();
  }, []);

  useEffect(() => {
    return subscribePrefersReducedMotion((matches) => {
      setReducedMotion(matches);
      setPresentation(detectPresentation(quality, forceFallback));
    });
  }, [forceFallback, quality]);

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
  const visible = shouldRunWorldFrameLoop({
    intersecting,
    documentVisible,
    reducedMotion,
  });
  const terrainReady = worldReady && webglReady;

  return (
    <div
      ref={rootRef}
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        className,
      )}
      data-world-reveal={terrainReady ? "terrain" : "pending"}
    >
      {webglReady ? (
        <MachuPicchuCanvas
          onContextLost={() => setContextLost(true)}
          onTargets={onTargets}
          onWorldReady={() => setWorldReady(true)}
          progressRef={progressRef}
          quality={presentation.quality}
          reducedMotion={reducedMotion}
          visible={visible}
        />
      ) : null}
      <MachuPicchuFallback className={paintedFallbackClassName(terrainReady)} />
    </div>
  );
}
