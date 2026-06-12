import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Inter } from "next/font/google";
import "./globals.css";
import "../styles/premium.css";
import { AuthProvider } from "../context/AuthContext";
import { ABTestProvider } from "../context/ABTestContext";
import GlobalNotificationListener from "@/components/GlobalNotificationListener";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import VercelAnalytics from "@/components/VercelAnalytics";

// Optimize fonts with next/font
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
});

// Inter font for Model U premium design
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

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
      className={`${spaceGrotesk.variable} ${manrope.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col model-u-gradient-hero-bg text-white">
        <ABTestProvider>
          <AuthProvider>
            <GlobalNotificationListener />
            <ServiceWorkerRegistrar />
            <VercelAnalytics />
            {children}
          </AuthProvider>
        </ABTestProvider>
      </body>
    </html>
  );
}
