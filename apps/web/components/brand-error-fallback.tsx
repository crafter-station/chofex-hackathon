"use client";

import { BrandStatusPage } from "@chofex/ui/components/brand";
import { Button } from "@chofex/ui/components/button";
import { useEffect } from "react";

export interface BrandErrorFallbackProps {
  readonly error: unknown;
  readonly reset: () => void;
  readonly retry?: () => void;
  readonly description?: string;
}

export function BrandErrorFallback({
  error,
  reset,
  retry,
  description = "No pudimos cargar esta página. Intenta nuevamente.",
}: BrandErrorFallbackProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const recover = retry ?? reset;

  return (
    <BrandStatusPage
      kicker="Error / 500"
      title="Algo salió mal"
      description={description}
    >
      <Button className="mt-8" size="landing" onClick={recover}>
        Intentar de nuevo
      </Button>
    </BrandStatusPage>
  );
}
