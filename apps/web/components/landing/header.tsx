import {
  landingCtaClassName,
  landingHudClassName,
} from "@/components/landing/shell";

export function LandingHeader() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-4 sm:px-8">
        <a
          className={`pointer-events-auto ${landingHudClassName} text-[10px] text-[#d6ff00]`}
          href="#top"
        >
          Hack the Andes
        </a>
        <nav
          aria-label="Secciones"
          className={`pointer-events-auto hidden gap-5 text-[10px] text-[#f5f5f5]/80 sm:flex ${landingHudClassName}`}
        >
          <a href="#judges">Jueces</a>
          <a href="#scan">Scan</a>
          <a href="#prizes">Premios</a>
          <a href="#apply">Aplicar</a>
        </nav>
      </div>
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
