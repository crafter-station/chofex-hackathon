import { skipLinks } from "@/components/landing/content";

export function LandingSkipLinks({
  applyHref = "#apply",
}: {
  readonly applyHref?: string;
}) {
  return (
    <nav aria-label="Atajos" className="landing-skip">
      {skipLinks.map((link) => {
        const href = link.href === "#apply" ? applyHref : link.href;
        return (
          <a href={href} key={link.href}>
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
