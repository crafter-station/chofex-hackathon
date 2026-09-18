import {
  BrandCenteredPage,
  BrandFrame,
  BrandKicker,
  BrandTitle,
} from "@chofex/ui/components/brand";
import { buttonVariants } from "@chofex/ui/components/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <BrandCenteredPage contentClassName="max-w-2xl text-center">
      <BrandFrame className="hud-box flex flex-col items-center px-6 py-12 sm:px-12 sm:py-16">
        <BrandKicker className="text-primary">Error / 404</BrandKicker>
        <BrandTitle as="h1" className="mt-6">
          Página no encontrada
        </BrandTitle>
        <p className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
          La ruta que buscas no existe o ya no está disponible.
        </p>
        <Link
          className={buttonVariants({ size: "landing", className: "mt-8" })}
          href="/"
        >
          Volver al inicio
        </Link>
      </BrandFrame>
    </BrandCenteredPage>
  );
}
