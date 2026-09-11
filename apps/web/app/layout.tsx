import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { DocumentLang } from "@/components/document-lang";
import { metadataCopy } from "@/components/landing/content";
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
  title: metadataCopy.title,
  description: metadataCopy.description,
  openGraph: {
    title: metadataCopy.title,
    description: metadataCopy.description,
    locale: "es_PE",
    siteName: metadataCopy.title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: metadataCopy.title,
    description: metadataCopy.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-svh font-sans antialiased`}
      >
        <DocumentLang />
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
