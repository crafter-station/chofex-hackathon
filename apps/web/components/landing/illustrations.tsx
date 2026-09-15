/**
 * Original SVG illustrations for Hack the Andes.
 *
 * Andean identity combined with an engineering aesthetic:
 *
 *   ContourSeal    — topographic rings viewed from directly above.
 *                    Each challenge card receives a unique formation, communicating
 *                    "sealed depth" — an unknown peak you have to discover.
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
