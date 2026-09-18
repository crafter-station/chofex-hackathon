"use client";

import {
  BrandErrorFallback,
  type BrandErrorFallbackProps,
} from "@/components/brand-error-fallback";
import {
  landingBrand,
  landingDisplay,
  landingMono,
  landingSans,
} from "@/components/landing/fonts";

import "@chofex/ui/globals.css";

export default function GlobalErrorPage(props: BrandErrorFallbackProps) {
  return (
    <html lang="es" className="brand-dark">
      <body
        className={`${landingBrand.variable} ${landingDisplay.variable} ${landingSans.variable} ${landingMono.variable} bg-background font-sans text-foreground antialiased`}
      >
        <title>Error | Hack the Andes</title>
        <BrandErrorFallback
          {...props}
          description="No pudimos cargar la aplicación. Intenta nuevamente."
        />
      </body>
    </html>
  );
}
