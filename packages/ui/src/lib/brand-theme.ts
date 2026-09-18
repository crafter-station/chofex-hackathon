/**
 * Brand colors for renderers that cannot resolve CSS custom properties, such
 * as generated images and email markup. The matching browser tokens live in
 * `src/styles/globals.css` and are covered by the web brand-theme test.
 */
export const brandColors = {
  dark: {
    paper: "#050406",
    surface: "#0d0c11",
    ink: "#f6f3ee",
    action: "#6f9bff",
    actionHover: "#9dbcff",
    status: "#f59d91",
    accent: "#ddcfbd",
    muted: "#bec3c9",
  },
  light: {
    paper: "#f3efe7",
    surface: "#fbf8f2",
    ink: "#0b1726",
    action: "#2459c9",
    actionHover: "#1b47a6",
    status: "#b83e35",
    accent: "#ddcfbd",
    muted: "#5b5f65",
  },
} as const;

export const brandColorWithAlpha = (color: string, alpha: number): string => {
  if (!/^#[\da-f]{6}$/i.test(color)) {
    throw new Error(`Expected a six-digit hex color, received ${color}`);
  }

  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};
