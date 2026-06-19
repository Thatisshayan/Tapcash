import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { PayoutTicker } from '@/components/sections/PayoutTicker';
import { OffersSection } from '@/components/sections/OffersSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { TapScoreSection } from '@/components/sections/TapScoreSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { PayoutMethodsSection } from '@/components/sections/PayoutMethodsSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { FinalCTASection } from '@/components/sections/FinalCTASection';

export const metadata: Metadata = {
  title: 'TapCash — Play Games. Earn Cash. Cash Out.',
  description:
    "Canada's premium rewards platform. Complete verified offers, track every step, cash out with confidence. Ledger-backed balances, real payouts.",
  openGraph: {
    title: 'TapCash — Play Games. Earn Cash. Cash Out.',
    description: "Canada's premium rewards platform. Real offers. Real payouts.",
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <PayoutTicker />
        <OffersSection />
        <HowItWorksSection />
        <TapScoreSection />
        <StatsSection />
        <PayoutMethodsSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <Footer />
    </>
  );
}
