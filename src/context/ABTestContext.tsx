'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type HeroVariant = 'v1-balanced' | 'v2-gaming' | 'v3-offers';

interface ABTestContextType {
  heroVariant: HeroVariant;
  setHeroVariant: (variant: HeroVariant) => void;
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined);

export function ABTestProvider({ children }: { children: React.ReactNode }) {
  const [heroVariant, setHeroVariant] = useState<HeroVariant>('v1-balanced');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage or use random assignment for new users
    const stored = localStorage.getItem('tapcash_hero_variant');
    if (stored && ['v1-balanced', 'v2-gaming', 'v3-offers'].includes(stored)) {
      setHeroVariant(stored as HeroVariant);
    } else {
      // Randomly assign new users to test groups
      const variants: HeroVariant[] = ['v1-balanced', 'v2-gaming', 'v3-offers'];
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];
      setHeroVariant(randomVariant);
      localStorage.setItem('tapcash_hero_variant', randomVariant);
    }
    setMounted(true);
  }, []);

  const handleSetHeroVariant = (variant: HeroVariant) => {
    setHeroVariant(variant);
    localStorage.setItem('tapcash_hero_variant', variant);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ABTestContext.Provider value={{ heroVariant, setHeroVariant: handleSetHeroVariant }}>
      {children}
    </ABTestContext.Provider>
  );
}

export function useABTest() {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within ABTestProvider');
  }
  return context;
}
