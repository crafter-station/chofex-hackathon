import { IBM_Plex_Mono, Oxanium, Zen_Dots } from "next/font/google";

export const landingDisplay = Oxanium({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-landing-display",
});

export const landingLed = Zen_Dots({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-landing-led",
});

export const landingMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-landing-mono",
});
