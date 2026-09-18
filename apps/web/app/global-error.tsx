"use client";

import { BrandStatusPage } from "@chofex/ui/components/brand";
import { Button } from "@chofex/ui/components/button";
import { useEffect } from "react";

import {
  landingBrand,
  landingDisplay,
  landingMono,
  landingSans,
} from "@/components/landing/fonts";

import "@chofex/ui/globals.css";

export default function GlobalErrorPage({
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
    <html lang="es" className="brand-dark">
      <body
        className={`${landingBrand.variable} ${landingDisplay.variable} ${landingSans.variable} ${landingMono.variable} bg-background font-sans text-foreground antialiased`}
      >
        <title>Error | Hack the Andes</title>
        <BrandStatusPage
          kicker="Error / 500"
          title="Algo salió mal"
          description="No pudimos cargar la aplicación. Intenta nuevamente."
        >
          <Button className="mt-8" size="landing" onClick={retry}>
            Intentar de nuevo
          </Button>
        </BrandStatusPage>
      </body>
    </html>
  );
}
