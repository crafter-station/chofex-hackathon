import type { ProjectedTarget } from "@/components/landing/machu-picchu-geometry";

export function ScanHud({
  visible,
  targets,
}: {
  readonly visible: boolean;
  readonly targets: readonly ProjectedTarget[];
}) {
  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <div className="landing-halftone" />
      <div className="landing-scanlines" />
      <div className="absolute top-28 left-4 font-mono text-[10px] tracking-[0.2em] text-[#e8ff00] uppercase sm:left-8">
        scan / talento
      </div>
      {targets.map((target) => {
        if (!target.visible) {
          return null;
        }
        return (
          <div
            className="landing-scan-box"
            key={target.id}
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: target.kind === "judge" ? "7.5rem" : "6.2rem",
              height: target.kind === "judge" ? "9.5rem" : "8rem",
              transform: "translate(-50%, -70%)",
            }}
          >
            <span className="landing-scan-box__label">{target.label}</span>
          </div>
        );
      })}
    </div>
  );
}
