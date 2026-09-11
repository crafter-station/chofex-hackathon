import { landingCtaClassName } from "@/components/landing/shell";

export function LandingHeader() {
  return (
    <header className="sr-only">
      <a href="#top">Hack the Andes</a>
      <a href="#apply">Aplicar</a>
    </header>
  );
}

export function LandingMobileCta() {
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 sm:hidden">
      <a href="#apply" className={`${landingCtaClassName} min-h-12 w-full`}>
        Aplicar
      </a>
    </div>
  );
}
