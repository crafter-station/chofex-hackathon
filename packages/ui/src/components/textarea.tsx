import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";

const textareaVariants = cva(
  "flex field-sizing-content min-h-24 w-full rounded-none border border-input bg-foreground/3 px-3 py-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:bg-input/20 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm",
  {
    variants: {
      resize: {
        vertical: "resize-y",
        none: "resize-none",
      },
    },
    defaultVariants: {
      resize: "vertical",
    },
  },
);

function Textarea({
  className,
  resize = "vertical",
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ resize, className }))}
      {...props}
    />
  );
}

export { Textarea, textareaVariants };
