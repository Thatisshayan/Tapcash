'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type HeroVariant = 'v1-balanced' | 'v2-gaming' | 'v3-offers';

interface ABTestContextType {
  heroVariant: HeroVariant;
  setHeroVariant: (variant: HeroVariant) => void;
  userId?: string;
  sessionId: string;
  trackEvent: (eventType: string, data?: Record<string, any>) => void;
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined);

export function ABTestProvider({ children }: { children: React.ReactNode }) {
  const [heroVariant, setHeroVariant] = useState<HeroVariant>('v1-balanced');
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [userId, setUserId] = useState<string | undefined>();

  // Generate or retrieve session ID
  useEffect(() => {
    const stored = localStorage.getItem('tapcash_session_id');
    if (stored) {
      setSessionId(stored);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('tapcash_session_id', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Load variant assignment and track assignment event
  useEffect(() => {
    const stored = localStorage.getItem('tapcash_hero_variant');
    let assignedVariant: HeroVariant;

    if (stored && ['v1-balanced', 'v2-gaming', 'v3-offers'].includes(stored)) {
      assignedVariant = stored as HeroVariant;
    } else {
      // Randomly assign new users to test groups
      const variants: HeroVariant[] = ['v1-balanced', 'v2-gaming', 'v3-offers'];
      assignedVariant = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem('tapcash_hero_variant', assignedVariant);
      
      // Track new variant assignment
      if (sessionId) {
        trackEventToBackend('variant_assigned', {
          variant: assignedVariant,
          sessionId,
          timestamp: new Date().toISOString(),
        });
      }
    }

    setHeroVariant(assignedVariant);
    setMounted(true);
  }, [sessionId]);

  const handleSetHeroVariant = (variant: HeroVariant) => {
    setHeroVariant(variant);
    localStorage.setItem('tapcash_hero_variant', variant);
    trackEventToBackend('variant_changed', {
      variant,
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
    });
  };

  const trackEvent = (eventType: string, data?: Record<string, any>) => {
    trackEventToBackend(eventType, {
      ...data,
      variant: heroVariant,
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <ABTestContext.Provider value={{ heroVariant, setHeroVariant: handleSetHeroVariant, userId, sessionId, trackEvent }}>
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

/**
 * Track A/B test events to the backend
 * Sends data to /api/ab-test/track endpoint for analytics
 */
async function trackEventToBackend(eventType: string, data: Record<string, any>) {
  try {
    // Use sendBeacon for reliability (fires even if page unloads)
    const payload = JSON.stringify({
      eventType,
      ...data,
    });

    // Fallback to fetch if sendBeacon not available
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/ab-test/track', payload);
    } else {
      // Non-blocking fetch with keepalive for unload scenarios
      fetch('/api/ab-test/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silently fail - don't disrupt user experience
      });
    }
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('A/B test tracking error:', error);
  }
}
