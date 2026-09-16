/**
 * Static opening for the drawn range.
 *
 * The live hero is a Draco GLB plus R3F. This still is what stands in before
 * that stack is allowed to start, and what stays if it never does: no WebGL,
 * reduced motion, save-data, or a weak device. It is a frame of the same
 * parked-in-range vantage the canvas opens on — not the older blue citadel
 * mockup and not a black void.
 *
 * Served as a plain `img` so the opening does not grow a next/image srcset
 * of 640–3840w variants for a decorative still.
 */
export const HERO_POSTER = {
  src: "/hero/sacred-valley-poster.webp",
  width: 1600,
  height: 900,
} as const;

export const HERO_POSTER_PRELOAD = {
  href: HERO_POSTER.src,
  as: "image",
  type: "image/webp",
} as const;

export function HeroPoster() {
  return (
    // biome-ignore lint/performance/noImgElement: decorative LCP still; avoid next/image srcset cost
    <img
      alt=""
      aria-hidden="true"
      className="absolute inset-0 size-full object-cover"
      decoding="async"
      fetchPriority="high"
      height={HERO_POSTER.height}
      src={HERO_POSTER.src}
      width={HERO_POSTER.width}
    />
  );
}
