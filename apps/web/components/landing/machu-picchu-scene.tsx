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
      className={cn("absolute inset-0 overflow-hidden bg-[#0057ff]", className)}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#8ec2ff_0%,#0057ff_38%,#0a2a88_72%,#07122b_100%)]" />
      <div className="absolute top-[18%] right-[16%] size-24 rounded-full bg-[#e8ff00] blur-[2px]" />
      <div className="absolute right-[-8%] bottom-[8%] h-[58%] w-[62%] rounded-[46%_40%_20%_60%] bg-[#9aa6b8]" />
      <div className="absolute right-[18%] bottom-[28%] h-[36%] w-[28%] rounded-[30%] bg-[#f4f7fb]" />
      <div className="absolute bottom-0 left-0 h-[22%] w-full bg-[#1d3f8a]" />
    </div>
  );
}

/**
 * Machu Picchu WebGL mount for `HeroScene`.
 *
 * Overlay contract:
 * - Render as children of `#hero-scene`
 * - Look layer accepts constrained drag; CTAs keep their own hit targets
 * - Landing type / CTAs stay in the scroll overlays
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

  return (
    <div
      ref={rootRef}
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        className,
      )}
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
      <MachuPicchuFallback
        className={paintedFallbackClassName(worldReady && webglReady)}
      />
    </div>
  );
}
