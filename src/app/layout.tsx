import type { Metadata } from 'next';
import { Syne, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import '../styles/premium.css';
import { AuthProvider } from '../context/AuthContext';
import { ABTestProvider } from '../context/ABTestContext';
import GlobalNotificationListener from '@/components/GlobalNotificationListener';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import VercelAnalytics from '@/components/VercelAnalytics';

const syne = Syne({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-syne',
  display: 'swap',
  preload: true,
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: 'TapCash — Play Games. Earn Cash. Cash Out.',
    template: '%s | TapCash',
  },
  description:
    "Canada's premium rewards platform. Complete verified offers, track every step, cash out with confidence. Ledger-backed balances, real payouts.",
  metadataBase: new URL('https://tapcash.online'),
  alternates: { canonical: '/' },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'TapCash',
    url: 'https://tapcash.online',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'TapCash' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    title: 'TapCash',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body
        className="min-h-full flex flex-col text-white"
        style={{ backgroundColor: '#0a0f0d', fontFamily: 'var(--font-inter), Inter, sans-serif' }}
      >
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
