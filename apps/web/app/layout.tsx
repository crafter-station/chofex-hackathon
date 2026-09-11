import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import "@chofex/ui/globals.css";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Hack the Andes",
  description:
    "Hackathon selectivo de IA en Lima, 10–11 de octubre 2026. Aplica con la CLI o con tu agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-svh font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            appearance={{ theme: shadcn }}
            signInFallbackRedirectUrl="/auth/complete"
            signUpFallbackRedirectUrl="/auth/complete"
          >
            <QueryProvider>{children}</QueryProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
