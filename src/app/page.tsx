import PremiumHeader from '@/components/layout/PremiumHeader';
import PremiumFooter from '@/components/layout/PremiumFooter';
import HeroDynamic from '@/components/landing/HeroDynamic';
import TopOffers from '@/components/landing/TopOffers';
import CashPathLive from '@/components/landing/CashPathLive';
import AppPreview from '@/components/landing/AppPreview';
import TapScoreSection from '@/components/landing/TapScoreSection';
import TrustStrip from '@/components/landing/TrustStrip';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TapCash | Play. Earn. Cash Out.',
  description: 'Complete verified offers. Track every step. Cash out when rewards clear. Premium rewards platform with ledger-backed balances.',
  openGraph: {
    title: 'TapCash | Play. Earn. Cash Out.',
    description: 'Complete verified offers and cash out when rewards clear.',
  },
};

export default function HomePage() {
  return (
    <>
      <PremiumHeader />
      
      <main className="model-u-page">
        <HeroDynamic />
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
