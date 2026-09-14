"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { SITE_STRUCTURES_GLB } from "@/components/landing/site-structures-place";
import { WEST_TERRAIN_GLB } from "@/components/landing/west-terrain-place";
import { ModelErrorBoundary } from "@/components/landing/model-error-boundary";
import {
  createDetailNormalMap,
  detailRepeat,
} from "@/components/landing/sacred-valley-detail";
import { heroSubjectFromLoadedGltf } from "@/components/landing/sacred-valley-glb";
import {
  SACRED_VALLEY_GLB,
  TERRAIN_MODEL_SCALE,
  TERRAIN_SIZE,
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

/**
 * Settle the baked Sentinel-2 drape.
 *
 * The GLB ships one sRGB JPEG over the whole corridor, so at grazing angles —
 * which is most of the flight — anisotropic filtering is the difference
 * between readable terraces and mush.
 */
export function tuneTerrainMaterial(
  source: THREE.Material,
  quality: SceneQuality,
  maxAnisotropy: number,
  detail?: THREE.Texture | null,
  albedoLift = 1,
): THREE.Material {
  if (!(source instanceof THREE.MeshStandardMaterial)) {
    return source;
  }

  source.metalness = 0;
  source.roughness = Math.max(0.88, source.roughness);
  /*
   * Set, never multiply. This function mutates the material in place and runs
   * from an effect, so a `multiplyScalar` here compounds every time the effect
   * re-runs — twice under StrictMode, again on each hot reload — and the
   * citadel went from a measured 1.8x lift to a blown-out white ghost. Every
   * other assignment in this function is idempotent; this one has to be too.
   * The glTF ships baseColorFactor [1,1,1], so setting the scalar outright is
   * exactly one application of the lift.
   */
  source.color.setScalar(albedoLift);

  const map = source.map;
  if (map) {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = quality === "high" ? maxAnisotropy : Math.min(4, maxAnisotropy);
    map.generateMipmaps = true;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.needsUpdate = true;
  }

  if (detail) {
    source.normalMap = detail;
    // Gentle. Enough to break up the near hillsides, not enough to read as
    // sandpaper once the camera pulls back and the tile mips away.
    source.normalScale = new THREE.Vector2(0.85, 0.85);
    // Adding a map the material was compiled without needs a shader rebuild.
    // Without this the texture is assigned and silently never sampled.
    source.needsUpdate = true;
  }

  return source;
}

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
  quality,
  onPresented,
}: {
  readonly quality: SceneQuality;
  readonly onPresented?: () => void;
}) {
  const gltf = useGLTF(SACRED_VALLEY_GLB, USE_DRACO, USE_MESHOPT);
  const { gl } = useThree();
  const clone = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const heroSubject = heroSubjectFromLoadedGltf({
    asset: gltf.asset,
    scene: clone,
  });

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    // Low-end GPUs skip the extra texture fetch entirely.
    const detail =
      quality === "high"
        ? createDetailNormalMap(detailRepeat(TERRAIN_SIZE.width * 200))
        : null;

    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      const source = child.material;
      if (Array.isArray(source)) {
        child.material = source.map((entry) =>
          tuneTerrainMaterial(entry, quality, maxAnisotropy, detail),
        );
        return;
      }
      if (source) {
        child.material = tuneTerrainMaterial(
          source,
          quality,
          maxAnisotropy,
          detail,
        );
      }
    });

    return () => {
      detail?.dispose();
    };
  }, [clone, gl, quality]);

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
  quality,
  onPresented,
}: {
  readonly quality: SceneQuality;
  readonly onPresented?: () => void;
}) {
  return (
    <ModelErrorBoundary fallback={null}>
      {/* Painted fallback covers the load; nothing stands in for the terrain. */}
      <Suspense fallback={null}>
        <SacredValleyGltf onPresented={onPresented} quality={quality} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

/**
 * How much to lift the citadel's drape.
 *
 * Not a look preference — a measurement. Sentinel-2 over Machu Picchu is cloud
 * forest and averages 34/255; the corridor's dry valley averages 67.7. Lit by
 * the same sun the two meshes share, the citadel came back with 82% of the
 * frame under 30/255, which is the closing shot of the scroll rendered
 * unreadable. Raising the scene's fill to compensate was the wrong lever: it
 * washed out the four stops that were already correctly exposed to fix the one
 * that was not. This puts the correction on the mesh that needs it.
 */
const WEST_ALBEDO_LIFT = 1.7;

function WestTerrainGltf({ quality }: { readonly quality: SceneQuality }) {
  const gltf = useGLTF(WEST_TERRAIN_GLB, USE_DRACO, USE_MESHOPT);
  const { gl } = useThree();
  const clone = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      const source = child.material;
      if (Array.isArray(source)) {
        child.material = source.map((entry) =>
          tuneTerrainMaterial(
            entry,
            quality,
            maxAnisotropy,
            null,
            WEST_ALBEDO_LIFT,
          ),
        );
        return;
      }
      if (source) {
        child.material = tuneTerrainMaterial(
          source,
          quality,
          maxAnisotropy,
          null,
          WEST_ALBEDO_LIFT,
        );
      }
    });
  }, [clone, gl, quality]);

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
export function WestTerrainAsset({
  quality,
}: {
  readonly quality: SceneQuality;
}) {
  return (
    <ModelErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <WestTerrainGltf quality={quality} />
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
      if (material instanceof THREE.MeshStandardMaterial) {
        material.metalness = 0;
        material.roughness = 0.95;
        /*
         * Flat shading, matching the terrain's own faceting. Smoothed normals
         * would round the terrace risers into their treads and lose the very
         * stepping the geometry exists to show.
         */
        material.flatShading = true;
        material.vertexColors = true;
        material.needsUpdate = true;
      }
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
