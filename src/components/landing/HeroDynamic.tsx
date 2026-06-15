'use client';

import { useABTest } from '@/context/ABTestContext';
import HeroV1Balanced from './HeroV1Balanced';
import HeroV2Gaming from './HeroV2Gaming';
import HeroV3Offers from './HeroV3Offers';

/**
 * Dynamic Hero component that renders different hero variants based on A/B test assignment.
 * This allows us to test conversion impact of different messaging and visuals.
 */
export default function HeroDynamic() {
  const { heroVariant } = useABTest();

  switch (heroVariant) {
    case 'v2-gaming':
      return <HeroV2Gaming />;
    case 'v3-offers':
      return <HeroV3Offers />;
    case 'v1-balanced':
    default:
      return <HeroV1Balanced />;
  }
}
