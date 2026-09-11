import { Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";

export const landingDisplay = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-landing-display",
});

export const landingMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-landing-mono",
});
