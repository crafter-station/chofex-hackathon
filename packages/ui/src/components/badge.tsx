import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const badgeVariants = cva(
  "group/badge inline-flex min-h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-none border border-transparent px-2 py-1 font-mono text-[0.68rem] font-medium whitespace-nowrap uppercase tracking-[0.1em] transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-primary/40 bg-primary/12 text-primary [a&]:hover:bg-primary/20",
        secondary:
          "border-border bg-secondary text-secondary-foreground [a&]:hover:bg-foreground/10",
        destructive:
          "border-destructive/40 bg-destructive/10 text-destructive focus-visible:ring-destructive/20 [a&]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a&]:hover:bg-muted [a&]:hover:text-foreground",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        statusDraft: "border-border bg-card text-muted-foreground",
        statusSubmitted:
          "border-[var(--hud-accent)]/40 bg-[var(--hud-accent)]/10 text-[var(--hud-accent)]",
        statusUnderReview: "border-primary/40 bg-primary/12 text-primary",
        statusWaitlisted:
          "border-foreground/35 bg-foreground/8 text-foreground",
        statusAccepted: "border-primary/55 bg-primary/18 text-primary",
        statusRejected:
          "border-destructive/50 bg-destructive/12 text-destructive",
        statusWithdrawn: "border-border bg-card text-muted-foreground/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
