import type * as React from "react";
import { cn } from "cn";

import { Input } from "#components/input";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn("relative", className)}
      {...props}
    />
  );
}

function InputGroupInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input data-slot="input-group-control" size="lg" leadingIcon {...props} />
  );
}

function InputGroupAddon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(
        "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupInput };
