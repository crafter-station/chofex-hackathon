import * as THREE from "three";

import {
  CONTOUR_HALF_WIDTH,
  CONTOUR_INTERVAL,
} from "@/components/landing/sacred-valley-contour";

/**
 * Drop the satellite drape and draw isolines instead.
 *
 * The poster field is black with chalk contour lines. The baked Sentinel
 * albedo and the raking sun that made it readable both fight that look, so
 * they come off here and the height itself becomes the drawing.
 */
export function applyContourMaterial(source: THREE.Material): THREE.Material {
  if (!(source instanceof THREE.Material)) {
    return source;
  }

  const next = new THREE.MeshBasicMaterial({
    color: 0x000000,
    fog: true,
    toneMapped: false,
  });
  next.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `#include <common>
varying float vContourHeight;`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `#include <project_vertex>
vContourHeight = (modelMatrix * vec4(transformed, 1.0)).y;`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
varying float vContourHeight;`,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `float contourBand = abs(fract(vContourHeight / ${CONTOUR_INTERVAL.toFixed(2)}) - 0.5);
float contourLine = 1.0 - smoothstep(0.0, ${CONTOUR_HALF_WIDTH.toFixed(3)}, contourBand);
gl_FragColor = vec4(vec3(contourLine), 1.0);
#include <dithering_fragment>`,
    );
  };
  next.customProgramCacheKey = () => "landing-contour-isolines";
  return next;
}
