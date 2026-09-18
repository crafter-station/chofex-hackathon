"use client";

import { BrandStatusPage } from "@chofex/ui/components/brand";
import { Button } from "@chofex/ui/components/button";
import { useEffect } from "react";

export interface BrandErrorFallbackProps {
  readonly error: Error & { readonly digest?: string };
  readonly retry: () => void;
  readonly description?: string;
}

export function BrandErrorFallback({
  error,
  retry,
  description = "No pudimos cargar esta página. Intenta nuevamente.",
}: BrandErrorFallbackProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <BrandStatusPage
      kicker="Error / 500"
      title="Algo salió mal"
      description={description}
    >
      <Button className="mt-8" size="landing" onClick={retry}>
        Intentar de nuevo
      </Button>
    </BrandStatusPage>
  );
}
