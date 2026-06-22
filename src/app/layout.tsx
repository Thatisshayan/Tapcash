import type { Metadata } from 'next';
import { Space_Grotesk, Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ABTestProvider } from '../context/ABTestContext';
import GlobalNotificationListener from '@/components/GlobalNotificationListener';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import SessionManager from '@/components/SessionManager';
import VercelAnalytics from '@/components/VercelAnalytics';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
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
      className={`${spaceGrotesk.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body
        className="min-h-full flex flex-col text-white"
        style={{ backgroundColor: '#0a0f0d', fontFamily: 'var(--font-manrope), Manrope, sans-serif' }}
      >
        <ABTestProvider>
          <AuthProvider>
            <GlobalNotificationListener />
            <ServiceWorkerRegistrar />
            <SessionManager />
            <VercelAnalytics />
            {children}
          </AuthProvider>
        </ABTestProvider>
      </body>
    </html>
  );
}
