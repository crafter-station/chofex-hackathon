"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { SITE_STRUCTURES_GLB } from "@/components/landing/site-structures-place";
import { WEST_TERRAIN_GLB } from "@/components/landing/west-terrain-place";
import { ModelErrorBoundary } from "@/components/landing/model-error-boundary";
import { applyContourMaterial } from "@/components/landing/sacred-valley-contour-material";
import { heroSubjectFromLoadedGltf } from "@/components/landing/sacred-valley-glb";
import {
  SACRED_VALLEY_GLB,
  TERRAIN_MODEL_SCALE,
} from "@/components/landing/sacred-valley-geometry";
import { isTerrainPresented } from "@/components/landing/world-reveal";

type SceneQuality = "low" | "high";

/**
 * The terrain mesh is Draco-compressed — ~35 MB of raw attributes down to
 * about 4 MB — so the decoder is required, not optional. It is served from
 * `public/draco/` rather than drei's default CDN so the hero has no
 * third-party runtime dependency.
 */
const USE_DRACO = "/draco/";
const USE_MESHOPT = false;

function ReportTerrainPresented({
  onPresented,
  heroSubject,
}: {
  readonly onPresented?: () => void;
  readonly heroSubject: "terrain" | null;
}) {
  const sent = useRef(false);
  const presentedFrames = useRef(0);

  useFrame(() => {
    if (sent.current || !onPresented) {
      return;
    }
    presentedFrames.current += 1;
    if (
      !isTerrainPresented({
        glbLoaded: true,
        presentedFrames: presentedFrames.current,
        heroSubject,
      })
    ) {
      return;
    }
    sent.current = true;
    onPresented();
  });

  return null;
}

function SacredValleyGltf({
  onPresented,
}: {
  readonly onPresented?: () => void;
}) {
  const gltf = useGLTF(SACRED_VALLEY_GLB, USE_DRACO, USE_MESHOPT);
  const clone = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const heroSubject = heroSubjectFromLoadedGltf({
    asset: gltf.asset,
    scene: clone,
  });

  useEffect(() => {
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      const source = child.material;
      if (Array.isArray(source)) {
        child.material = source.map((entry) => applyContourMaterial(entry));
        return;
      }
      if (source) {
        child.material = applyContourMaterial(source);
      }
    });
  }, [clone]);

  /*
   * No `<Center>` here on purpose. The build script authors the mesh centred
   * on its bounding box, and `sacred-valley-place.ts` reports the flight path
   * and town anchors in those same units. Re-centring at runtime would slide
   * the terrain out from under the camera path.
   */
  return (
    <>
      <primitive object={clone} scale={TERRAIN_MODEL_SCALE} />
      <ReportTerrainPresented
        heroSubject={heroSubject}
        onPresented={onPresented}
      />
    </>
  );
}

export function SacredValleyAsset({
  onPresented,
}: {
  readonly quality: SceneQuality;
  readonly onPresented?: () => void;
}) {
  return (
    <ModelErrorBoundary fallback={null}>
      {/* Painted fallback covers the load; nothing stands in for the terrain. */}
      <Suspense fallback={null}>
        <SacredValleyGltf onPresented={onPresented} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

function WestTerrainGltf() {
  const gltf = useGLTF(WEST_TERRAIN_GLB, USE_DRACO, USE_MESHOPT);
  const clone = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      const source = child.material;
      if (Array.isArray(source)) {
        child.material = source.map((entry) => applyContourMaterial(entry));
        return;
      }
      if (source) {
        child.material = applyContourMaterial(source);
      }
    });
  }, [clone]);

  /*
   * No transform, deliberately. This mesh is authored at its true offset from
   * the Sacred Valley origin and snapped onto the corridor's sampling lattice,
   * so it meets the corridor seamlessly by construction. Centring or placing
   * it here would undo work the build script already did exactly.
   */
  return <primitive object={clone} scale={TERRAIN_MODEL_SCALE} />;
}

/**
 * The gorge and the citadel, fetched only once the scroll heads west.
 *
 * 1.7 MB that most readers never reach, so it stays off the initial payload.
 * The flight starts it one station early — as the camera leaves Ollantaytambo
 * — which leaves the whole last transfer as loading time.
 */
export function WestTerrainAsset() {
  return (
    <ModelErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <WestTerrainGltf />
      </Suspense>
    </ModelErrorBoundary>
  );
}

function SiteStructuresGltf() {
  const gltf = useGLTF(SITE_STRUCTURES_GLB, USE_DRACO, USE_MESHOPT);
  const clone = useMemo(() => gltf.scene.clone(true), [gltf.scene]);


  useEffect(() => {
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      const material = child.material;
      child.material = applyContourMaterial(material);
    });
  }, [clone]);

  // Authored in the same scene units as the terrain, at its true position.
  return <primitive object={clone} />;
}

/**
 * Terraces, towns and salt pans at the five sites.
 *
 * Under 100 KB, so it loads with the corridor rather than on demand — and it
 * has to, because a site that pops into existence as the reader arrives would
 * be worse than one that was never there.
 */
export function SiteStructuresAsset() {
  return (
    <ModelErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <SiteStructuresGltf />
      </Suspense>
    </ModelErrorBoundary>
  );
}

useGLTF.preload(SACRED_VALLEY_GLB, USE_DRACO, USE_MESHOPT);
useGLTF.preload(SITE_STRUCTURES_GLB, USE_DRACO, USE_MESHOPT);
