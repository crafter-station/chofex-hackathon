import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { DocumentLang } from "@/components/document-lang";
import { brandName, metadataCopy } from "@/components/landing/content";
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
  metadataBase: new URL("https://andes.crafter.run"),
  title: metadataCopy.title,
  description: metadataCopy.description,
  openGraph: {
    title: metadataCopy.title,
    description: metadataCopy.description,
    locale: "es_PE",
    siteName: brandName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: metadataCopy.title,
    description: metadataCopy.description,
  },
};

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkConfigured = Boolean(
  clerkPublishableKey &&
    !clerkPublishableKey.includes("replace_me") &&
    /^pk_(test|live)_/.test(clerkPublishableKey),
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryProvider = <QueryProvider>{children}</QueryProvider>;
  let content = queryProvider;

  if (clerkConfigured) {
    content = (
      <ClerkProvider
        appearance={{ theme: shadcn }}
        signInFallbackRedirectUrl="/auth/complete"
        signUpFallbackRedirectUrl="/auth/complete"
      >
        {queryProvider}
      </ClerkProvider>
    );
  }

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
          {content}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
