import { Archivo_Black, IBM_Plex_Mono, Outfit } from "next/font/google";

export const landingDisplay = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-landing-display",
});

export const landingSans = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-landing-sans",
});

export const landingMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-landing-mono",
});
