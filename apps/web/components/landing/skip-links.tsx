import { skipLinks } from "@/components/landing/content";

export function LandingSkipLinks() {
  return (
    <nav aria-label="Atajos" className="landing-skip">
      {skipLinks.map((link) => (
        <a href={link.href} key={link.href}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
