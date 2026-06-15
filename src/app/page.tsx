import PremiumHeader from '@/components/layout/PremiumHeader';
import PremiumFooter from '@/components/layout/PremiumFooter';
import HeroPremium from '@/components/landing/HeroPremium';
import TopOffersPremium from '@/components/landing/TopOffersPremium';
import CashPathLivePremium from '@/components/landing/CashPathLivePremium';
import AppPreview from '@/components/landing/AppPreview';
import TapScoreSectionPremium from '@/components/landing/TapScoreSectionPremium';
import TrustStripPremium from '@/components/landing/TrustStripPremium';
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
      
      <main>
        <HeroPremium />
        <TopOffersPremium />
        <CashPathLivePremium />
        <AppPreview />
        <TapScoreSectionPremium />
        <TrustStripPremium />
      </main>

      <PremiumFooter />
    </>
  );
}
