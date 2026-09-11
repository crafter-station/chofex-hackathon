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
    <div className="fixed inset-x-0 bottom-0 z-40 border-[#e1ff00] border-t bg-[#1a1a1a] p-3 sm:hidden">
      <a href="#apply" className={`${landingCtaClassName} min-h-12 w-full`}>
        Aplicar
      </a>
    </div>
  );
}
