import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import GlobalNotificationListener from "@/components/GlobalNotificationListener";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tapcash.online"),
  title: "TapCash | Earn Rewards in Canada",
  description: "Earn real cash by completing surveys, playing games, and downloading apps. Fast payouts and secure rewards.",
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
    title: "TapCash | Earn Rewards in Canada",
    description: "Earn real cash by completing surveys, playing games, and downloading apps. Fast payouts and secure rewards.",
    url: "https://tapcash.online",
    siteName: "TapCash",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "TapCash | Earn Rewards in Canada",
      },
    ],
    locale: "en_CA",
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
      className={`${spaceGrotesk.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <AuthProvider>
          <GlobalNotificationListener />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
