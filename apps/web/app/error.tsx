"use client";

import { BrandStatusPage } from "@chofex/ui/components/brand";
import { Button } from "@chofex/ui/components/button";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <BrandStatusPage
      kicker="Error / 500"
      title="Algo salió mal"
      description="No pudimos cargar esta página. Intenta nuevamente."
    >
      <Button className="mt-8" size="landing" onClick={retry}>
        Intentar de nuevo
      </Button>
    </BrandStatusPage>
  );
}
