import { BrandStatusPage } from "@chofex/ui/components/brand";
import { buttonVariants } from "@chofex/ui/components/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <BrandStatusPage
      kicker="Error / 404"
      title="Página no encontrada"
      description="La ruta que buscas no existe o ya no está disponible."
    >
      <Link
        className={buttonVariants({ size: "landing", className: "mt-8" })}
        href="/"
      >
        Volver al inicio
      </Link>
    </BrandStatusPage>
  );
}
