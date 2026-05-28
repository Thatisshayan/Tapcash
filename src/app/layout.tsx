import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import GlobalNotificationListener from "@/components/GlobalNotificationListener";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  metadataBase: new URL("https://tapcash.online"),
  title: "TapCash | Ledger-First Rewards",
  description: "A premium rewards platform with verified offers, ledger-backed balances, and manual cashout control.",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "TapCash",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "TapCash | Ledger-First Rewards",
    description: "A premium rewards platform with verified offers, ledger-backed balances, and manual cashout control.",
    url: "https://tapcash.online",
    siteName: "TapCash",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "TapCash | Ledger-First Rewards",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={
        {
          "--font-space-grotesk": '"Space Grotesk", "Segoe UI", sans-serif',
          "--font-manrope": '"Manrope", "Segoe UI", sans-serif',
        } as CSSProperties
      }
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <AuthProvider>
          <GlobalNotificationListener />
          <ServiceWorkerRegistrar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
