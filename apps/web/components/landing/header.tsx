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
    <div className="fixed inset-x-0 bottom-0 z-40 border-[#0057ff]/15 border-t bg-[#07122b]/88 p-3 backdrop-blur-md sm:hidden">
      <a href="#apply" className={`${landingCtaClassName} min-h-12 w-full`}>
        Aplicar
      </a>
    </div>
  );
}
