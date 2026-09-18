import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";

const inputVariants = cva(
  "w-full min-w-0 rounded-none border border-input bg-foreground/3 px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/20 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm",
  {
    variants: {
      size: {
        default: "h-10",
        lg: "h-12",
      },
      leadingIcon: {
        true: "pl-9",
      },
    },
    defaultVariants: {
      size: "default",
      leadingIcon: false,
    },
  },
);

function Input({
  className,
  type,
  size = "default",
  leadingIcon = false,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size, leadingIcon, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
