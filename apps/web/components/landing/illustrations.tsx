/**
 * Original SVG illustrations for Hack the Andes.
 *
 * Three motifs, combining Andean identity with engineering aesthetics:
 *
 *   ContourSeal    — topographic rings viewed from directly above.
 *                    Each challenge card receives a unique formation, communicating
 *                    "sealed depth" — an unknown peak you have to discover.
 *
 *   ElevationSlice — terrain cross-section read like technical documentation.
 *                    Side-view Andean profile with summit marker and baseline,
 *                    used as a visual bridge in the audience section.
 *
 * All are pure inline SVG: zero JS, static under prefers-reduced-motion,
 * with appropriate aria treatment per use case.
 */

import type { SVGProps } from "react";

// ─── ContourSeal ─────────────────────────────────────────────────────────────

type ContourSealProps = SVGProps<SVGSVGElement> & {
  /** Half-width of the outermost ring (default 96 SVG units). */
  rxOuter?: number;
  /** Half-height of the outermost ring (default 74 SVG units). */
  ryOuter?: number;
  /** Rotation of the ring stack in degrees (default 0). */
  rotateDeg?: number;
};

const CONTOUR_RING_SCALES = [
  { scale: 1.0, opacity: 0.055 },
  { scale: 0.81, opacity: 0.07 },
  { scale: 0.635, opacity: 0.09 },
  { scale: 0.48, opacity: 0.11 },
  { scale: 0.32, opacity: 0.135 },
  { scale: 0.175, opacity: 0.165 },
] as const;

/**
 * An Andean peak viewed from directly above: concentric ellipses that narrow
 * toward a summit dot. Formation parameters let each challenge card carry a
 * distinct topo signature — different ridge shapes, different geologies.
 *
 * Always aria-hidden — placed behind card content as background illustration.
 */
export function ContourSeal({
  rxOuter = 96,
  ryOuter = 74,
  rotateDeg = 0,
  className,
  ...props
}: ContourSealProps) {
  const groupTransform =
    rotateDeg !== 0 ? `rotate(${rotateDeg}, 100, 100)` : undefined;

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform={groupTransform}>
        {CONTOUR_RING_SCALES.map(({ scale, opacity }) => (
          <ellipse
            key={scale}
            cx="100"
            cy="100"
            fill="none"
            opacity={opacity}
            rx={rxOuter * scale}
            ry={ryOuter * scale}
            stroke="currentColor"
            strokeWidth="1"
          />
        ))}
        {/* Summit: the single point all contours converge toward */}
        <circle cx="100" cy="100" fill="currentColor" opacity="0.22" r="2.5" />
      </g>
    </svg>
  );
}

// ─── ElevationSlice ───────────────────────────────────────────────────────────

/**
 * Side-view terrain cross-section in the style of technical field documentation:
 * elevation profile, baseline, ruler ticks, summit marker with vertical guide.
 *
 * The ridge shape is an original Andean silhouette — multiple peaks, asymmetric,
 * with the main summit left-of-centre (the way mountains actually are).
 *
 * Always aria-hidden — decorative visual bridge in the audience section.
 */

const TERRAIN_PROFILE =
  "M 0,52 L 24,46 L 48,34 L 66,22 L 84,10 L 104,20 L 124,12 L 148,26 L 168,16 L 192,30 L 216,22 L 244,38 L 272,46 L 296,50 L 320,52";

const TERRAIN_FILL =
  "M 0,52 L 24,46 L 48,34 L 66,22 L 84,10 L 104,20 L 124,12 L 148,26 L 168,16 L 192,30 L 216,22 L 244,38 L 272,46 L 296,50 L 320,52 L 320,64 L 0,64 Z";

const SUMMIT_X = 84;
const SUMMIT_Y = 10;
const BASELINE_Y = 52;

const TICK_XS = [0, 40, 80, 120, 160, 200, 240, 280, 320] as const;

export function ElevationSlice({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 320 64"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Ground fill: area below the terrain profile */}
      <path d={TERRAIN_FILL} fill="currentColor" opacity="0.045" />

      {/* Terrain profile line */}
      <path
        d={TERRAIN_PROFILE}
        opacity="0.38"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />

      {/* Baseline — the measurement floor */}
      <line
        opacity="0.12"
        stroke="currentColor"
        strokeWidth="1"
        x1="0"
        x2="320"
        y1={BASELINE_Y}
        y2={BASELINE_Y}
      />

      {/* Ruler ticks along the baseline */}
      {TICK_XS.map((x) => (
        <line
          key={x}
          opacity="0.07"
          stroke="currentColor"
          strokeWidth="0.8"
          x1={x}
          x2={x}
          y1={BASELINE_Y}
          y2={BASELINE_Y + 5}
        />
      ))}

      {/* Summit marker: dot + vertical guide to the baseline */}
      <circle
        cx={SUMMIT_X}
        cy={SUMMIT_Y}
        fill="currentColor"
        opacity="0.42"
        r="2"
      />
      <line
        opacity="0.2"
        stroke="currentColor"
        strokeDasharray="2 3"
        strokeWidth="0.8"
        x1={SUMMIT_X}
        x2={SUMMIT_X}
        y1={SUMMIT_Y + 2.5}
        y2={BASELINE_Y}
      />
    </svg>
  );
}
