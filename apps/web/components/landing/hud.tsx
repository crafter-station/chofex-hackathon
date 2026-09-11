import { cn } from "@chofex/ui/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export function HudLabel({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.18em] uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function ScanTarget({
  code,
  label,
  children,
  className,
  locked = false,
}: {
  readonly code: string;
  readonly label: string;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly locked?: boolean;
}) {
  return (
    <article className={cn("hud-box p-4 sm:p-5", className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <HudLabel className="text-[#d6ff00]">{code}</HudLabel>
        <HudLabel className="text-[#f5f5f5]/70">
          {locked ? "Bloqueado" : "live"}
        </HudLabel>
      </div>
      <p className="font-[family-name:var(--font-landing-display)] text-2xl uppercase leading-none tracking-[-0.02em] sm:text-3xl">
        {label}
      </p>
      {children}
    </article>
  );
}

export function DeviceCard({
  code,
  handle,
  title,
  body,
  accent,
}: {
  readonly code: string;
  readonly handle: string;
  readonly title: string;
  readonly body: string;
  readonly accent: "yellow" | "blue";
}) {
  const handleClassName =
    accent === "yellow"
      ? "bg-[#d6ff00] text-[#0b0d10]"
      : "bg-[#0057ff] text-[#f5f5f5]";

  return (
    <article className="flex flex-col overflow-hidden border border-[#f5f5f5]/15 bg-[#111318]">
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.16em] uppercase",
          handleClassName,
        )}
      >
        <span>{code}</span>
        <span>unit</span>
      </div>
      <div className="relative aspect-4/3 overflow-hidden bg-[#0b0d10]">
        <div className="hud-halftone absolute inset-0 opacity-50" />
        <div className="absolute inset-4 border border-[#f5f5f5]/35" />
        <div className="absolute inset-0 grid place-items-center">
          <p className="font-[family-name:var(--font-landing-display)] text-5xl text-[#f5f5f5]/90 uppercase sm:text-6xl">
            {handle}
          </p>
        </div>
        <HudLabel className="absolute right-5 bottom-5 text-[#d6ff00]">
          scan
        </HudLabel>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <HudLabel className="text-[#f5f5f5]/45">{handle}</HudLabel>
        <h3 className="font-[family-name:var(--font-landing-display)] text-2xl uppercase leading-none tracking-[-0.02em]">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-[#f5f5f5]/70">{body}</p>
      </div>
    </article>
  );
}
