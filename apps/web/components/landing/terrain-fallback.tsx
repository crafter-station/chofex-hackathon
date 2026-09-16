import type { SVGProps } from "react";

/**
 * Static contour stand-in for the Sacred Valley hero.
 *
 * Shown while WebGL is unavailable, still loading, or lost. Decorative only —
 * the hero lockup already names the event, so this stays hidden from
 * assistive technology.
 */
const ISOLINES = [
  {
    d: "M-80 820 C 140 760 360 790 560 700 S 980 560 1240 620 S 1480 740 1720 700",
    o: 0.14,
  },
  {
    d: "M-80 760 C 180 700 400 740 620 640 S 1000 500 1280 570 S 1500 690 1720 650",
    o: 0.16,
  },
  {
    d: "M-80 700 C 200 640 420 690 640 580 S 1020 450 1300 520 S 1520 640 1720 600",
    o: 0.18,
  },
  {
    d: "M-40 640 C 220 580 460 630 680 520 S 1040 400 1320 470 S 1540 590 1680 550",
    o: 0.2,
  },
  {
    d: "M40 590 C 260 530 500 580 720 470 S 1060 360 1340 430 S 1540 540 1640 510",
    o: 0.22,
  },
  {
    d: "M120 540 C 300 490 540 530 760 430 S 1080 330 1340 400 S 1520 500 1600 470",
    o: 0.24,
  },
  {
    d: "M200 500 C 360 460 580 490 800 400 S 1100 310 1320 380 S 1480 460 1560 440",
    o: 0.26,
  },
  {
    d: "M300 460 C 440 430 640 450 840 380 S 1120 300 1280 360 S 1420 430 1500 410",
    o: 0.28,
  },
  {
    d: "M420 430 C 540 410 720 420 900 370 S 1140 310 1260 350 S 1360 400 1440 390",
    o: 0.3,
  },
  { d: "M560 400 C 680 380 820 390 960 360 S 1160 320 1240 350", o: 0.34 },
  { d: "M720 375 C 820 360 940 365 1040 350 S 1160 335 1200 345", o: 0.4 },
] as const;

export function TerrainFallback(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1600 900"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {ISOLINES.map((line) => (
        <path
          d={line.d}
          key={line.d}
          opacity={line.o}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.25"
        />
      ))}
      <circle cx="1040" cy="348" fill="currentColor" opacity="0.42" r="2.5" />
    </svg>
  );
}
