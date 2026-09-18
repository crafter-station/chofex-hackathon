/**
 * Clerk's hosted controls cannot render our React primitives, so this is the
 * one adapter that maps the design system onto Clerk's documented appearance
 * slots. Keep it beside the tokens instead of restyling auth pages locally.
 */
export const brandClerkAppearance = {
  options: {
    logoPlacement: "none",
  },
  variables: {
    borderRadius: "0px",
    colorBackground: "var(--background)",
    colorBorder: "var(--border)",
    colorDanger: "var(--destructive)",
    colorForeground: "var(--foreground)",
    colorInput: "var(--hud-field)",
    colorInputForeground: "var(--foreground)",
    colorMuted: "var(--muted)",
    colorMutedForeground: "var(--muted-foreground)",
    colorNeutral: "var(--foreground)",
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorRing: "var(--ring)",
    fontFamily: "var(--font-hta-sans), ui-sans-serif, system-ui, sans-serif",
    fontFamilyButtons:
      "var(--font-hta-mono), ui-monospace, SFMono-Regular, monospace",
    fontFamilyMono:
      "var(--font-hta-mono), ui-monospace, SFMono-Regular, monospace",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "border border-border bg-card shadow-none",
    headerTitle: "font-display text-2xl uppercase",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton:
      "min-h-10 border-foreground/45 bg-transparent font-mono uppercase tracking-[0.1em] hover:bg-foreground/10",
    dividerText: "font-mono text-[0.68rem] uppercase tracking-[0.1em]",
    formFieldLabel: "font-mono text-[0.68rem] uppercase tracking-[0.1em]",
    formFieldInput:
      "min-h-10 border-input bg-foreground/3 focus:border-primary focus:ring-primary/35",
    formButtonPrimary:
      "min-h-10 bg-primary font-mono font-semibold text-primary-foreground uppercase tracking-[0.1em] hover:bg-[var(--hud-action-hover)]",
    footerActionLink:
      "font-semibold text-primary hover:text-[var(--hud-action-hover)]",
  },
} as const;
