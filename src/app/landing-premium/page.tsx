import PremiumHeader from '@/components/layout/PremiumHeader';
import PremiumFooter from '@/components/layout/PremiumFooter';
import Hero from '@/components/landing/Hero';
import TopOffers from '@/components/landing/TopOffers';
import CashPathLive from '@/components/landing/CashPathLive';
import AppPreview from '@/components/landing/AppPreview';
import TapScoreSection from '@/components/landing/TapScoreSection';
import TrustStrip from '@/components/landing/TrustStrip';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TapCash | Play. Earn. Cash Out.',
  description: 'Complete verified offers. Track every step. Cash out when rewards clear. Premium rewards platform with ledger-backed balances.',
};

export default function PremiumLandingPage() {
  return (
    <>
      <PremiumHeader />
      
      <main className="model-u-page">
        <Hero />
        <TopOffers />
        <CashPathLive />
        <AppPreview />
        <TapScoreSection />
        <TrustStrip />
      </main>

      <PremiumFooter />
    </>
  );
}

// Made with Bob
