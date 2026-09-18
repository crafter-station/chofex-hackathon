import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

interface RowActionProps
  extends Omit<
    ComponentProps<"button">,
    "aria-label" | "children" | "className"
  > {
  readonly label: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly contentClassName?: string;
}

/**
 * Makes rich row content actionable without turning its labels and supporting
 * text into a multiline button. The empty overlay owns the interaction and an
 * explicit accessible name; the adjacent content owns the presentation.
 */
export function RowAction({
  label,
  children,
  className,
  contentClassName,
  type = "button",
  ...props
}: RowActionProps) {
  return (
    <div className={cn("group relative", className)}>
      <button
        type={type}
        aria-label={label}
        className="brand-row-action__button peer absolute inset-0 z-10 cursor-pointer disabled:cursor-not-allowed"
        {...props}
      />
      <div
        className={cn(
          "transition-colors peer-hover:bg-foreground/8 peer-focus-visible:bg-foreground/8 peer-disabled:opacity-45",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
