import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { OffersSection } from '@/components/sections/OffersSection';
import { CashPathSection } from '@/components/sections/CashPathSection';
import { TruthModeSection } from '@/components/sections/TruthModeSection';
import { AppShowcaseSection } from '@/components/sections/AppShowcaseSection';
import { TrustStripSection } from '@/components/sections/TrustStripSection';

export const metadata: Metadata = {
  title: 'TapCash — Play Games. Earn Cash. Cash Out.',
  description:
    "Canada's premium gaming rewards platform. Complete verified offers, track every step, cash out fast. Real payouts, zero hidden fees.",
  openGraph: {
    title: 'TapCash — Play Games. Earn Cash. Cash Out.',
    description: "Canada's premium gaming rewards platform. Real offers. Real payouts.",
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <OffersSection />
        <CashPathSection />
        <TruthModeSection />
        <AppShowcaseSection />
        <TrustStripSection />
      </main>
      <Footer />
    </>
  );
}
