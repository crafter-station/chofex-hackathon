import { scanCopy } from "@/components/landing/content";
import type { ProjectedTarget } from "@/components/landing/sacred-valley-geometry";

/**
 * Labels the sites the camera can currently see.
 *
 * The boxes used to frame invented figures with names like TALENTO and ÉLITE.
 * Every one of them is now a real place at a measured position, which is the
 * claim the landing is making in the first place — pointing the same HUD at
 * fictional targets was quietly undercutting it.
 */
export function ScanHud({
  visible,
  targets,
  station,
  focus,
}: {
  readonly visible: boolean;
  readonly targets: readonly ProjectedTarget[];
  /** The site the scroll is currently parked on. */
  readonly station: string;
  /** 1 while parked on it, 0 mid-transfer. */
  readonly focus: number;
}) {
  if (!visible) {
    return null;
  }

  /*
   * One box, for the site being talked about.
   *
   * Every site in range used to be labelled at once, so the frame carried
   * boxes for places the copy was not discussing and the reader had no way to
   * tell which one the panel meant. The marker is a pointer to the subject, so
   * it appears with the subject and leaves with it.
   */
  const current = targets.find(
    (target) => target.id === station && target.visible,
  );

  return (
    /*
     * Below the chapter panels, not level with them.
     *
     * Both sat at z-20 and this painted second, so a marker for a site off to
     * one side was drawn straight over the copy. Sliding behind the panel is
     * the right behaviour — the box is a readout pinned to the landscape, and
     * landscape is what the panel is covering.
     */
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[15] overflow-hidden"
    >
      <div className="hud-scanlines absolute inset-0 opacity-70" />
      {/* Right-hand side: the chapter panels own the left, and the two were
          landing on the same line. */}
      <div className="absolute top-28 right-4 font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.2em] text-[var(--hud-type)] uppercase sm:right-8">
        {scanCopy.overlayKicker}
      </div>
      {current ? (
        <div
          className="landing-scan-box"
          key={current.id}
          style={{
            left: `${current.x}%`,
            top: `${current.y}%`,
            width: "7.5rem",
            height: "5rem",
            transform: "translate(-50%, -50%)",
            // Fades with its own panel, so the two arrive and leave together.
            opacity: focus,
          }}
        >
          <span className="landing-scan-box__label">
            {current.label}
            <span className="ml-2 opacity-70">
              {current.elevation.toLocaleString("es-PE")} m
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
