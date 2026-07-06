# LAUNCH_CHECKLIST.md — TapCash Launch Readiness Checklist

**Generated:** July 6, 2026  
**Based on:** ALL 9 DOCUMENTS  
**Purpose:** Final checklist before production launch  

---

## PRE-LAUNCH CHECKLIST

### Security (Sprint 1)
- [ ] Firebase service account key rotated
- [ ] Compromised key purged from git history
- [ ] All API keys rotated (RapidoReach, ProxyCheck, Resend)
- [ ] Admin API authentication migrated to session cookies
- [ ] CSRF protection implemented on all mutating endpoints
- [ ] Idempotency keys on all financial operations
- [ ] Cashout validation rules enforced
- [ ] User session system with httpOnly cookies
- [ ] Origin validation on all API routes
- [ ] Security audit passed with 0 P0 findings

### Backend (Sprint 2)
- [ ] All Firestore read-then-write patterns wrapped in transactions
- [ ] Firebase Functions migrated from v1 to v2
- [ ] Environment variables validated at build time (Zod)
- [ ] No hardcoded fallback values in code
- [ ] Redis distributed cache operational
- [ ] GDPR data export endpoint working
- [ ] Account deletion with 30-day grace period
- [ ] Age verification on signup
- [ ] Cookie consent banner live
- [ ] Privacy policy page live
- [ ] Terms of service page live
- [ ] Firestore composite indexes deployed

### Frontend (Sprint 3)
- [ ] Landing page rebuilt with conversion elements
- [ ] Hero section with animated counters
- [ ] Live feed widget operational
- [ ] Social proof bar with real stats
- [ ] Cashout methods strip
- [ ] FAQ section
- [ ] Dashboard gamification layer
- [ ] Coin balance widget with animation
- [ ] Daily streak widget (Duolingo-style)
- [ ] Offer cards with difficulty badges
- [ ] Mini feed of recent cashouts
- [ ] Stats panel
- [ ] Leaderboard section
- [ ] Cashout flow redesigned (single page)
- [ ] Gift card bonus mechanic
- [ ] Legal pages linked from footer

### Mobile (Sprint 4)
- [ ] All PremiumUi imports fixed
- [ ] EAS configuration created
- [ ] Expo account linked
- [ ] Environment variables configured
- [ ] iOS build passing
- [ ] Android build passing
- [ ] iOS TestFlight build working
- [ ] Android APK build working
- [ ] Biometric auth working on both platforms
- [ ] Push notifications working on both platforms
- [ ] Offline Firestore persistence enabled
- [ ] Deep linking working
- [ ] Dark theme applied to all screens
- [ ] All screens rebuilt to match web

### Testing (Sprint 5)
- [ ] 150+ tests passing
- [ ] 80%+ line coverage
- [ ] Fraud detection unit tests (15)
- [ ] Rate limiting tests (8)
- [ ] Transaction atomicity tests (10)
- [ ] Admin authorization tests (12)
- [ ] Input validation tests (10)
- [ ] E2E signup → offer → cashout flow (5)
- [ ] E2E admin workflow (3)
- [ ] Penetration test passed
- [ ] CSRF: auto-submitting forms rejected
- [ ] XSS: payloads in input fields sanitized
- [ ] Rate limit bypass: proxy rotation tested
- [ ] Auth bypass: expired tokens rejected
- [ ] IDOR: other users' data inaccessible
- [ ] Mass assignment: `{isAdmin: true}` rejected

### Performance (Sprint 5)
- [ ] Lighthouse: LCP <2.5s
- [ ] Lighthouse: FCP <1.8s
- [ ] Lighthouse: CLS <0.1
- [ ] Lighthouse: TTI <3.5s
- [ ] Bundle size: Landing <200KB
- [ ] Bundle size: Dashboard <300KB
- [ ] Images optimized (WebP, lazy loading)
- [ ] API responses compressed
- [ ] No memory leaks

### Monitoring (Sprint 5)
- [ ] Sentry error tracking configured
- [ ] Better Uptime monitoring active
- [ ] Firebase Performance Monitoring enabled
- [ ] Structured logging with correlation IDs
- [ ] Log aggregation working
- [ ] Alert channels configured

### Legal & Compliance (Sprint 5)
- [ ] Privacy policy PIPEDA-compliant
- [ ] Terms of service complete
- [ ] Cookie consent working
- [ ] GDPR export working end-to-end
- [ ] Account deletion working end-to-end
- [ ] Age verification working
- [ ] Consent timestamps stored

---

## LAUNCH DAY CHECKLIST

### Pre-Deploy (T-2h)
- [ ] All tests passing on main branch
- [ ] No open P0/P1 issues
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Emergency contacts listed
- [ ] Team notified of launch window

### Deploy (T-0)
- [ ] Firebase Functions deployed
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] Vercel build triggered
- [ ] Environment variables verified in Vercel
- [ ] Custom domain configured
- [ ] SSL certificate active

### Post-Deploy (T+1h)
- [ ] Landing page loads correctly
- [ ] Signup flow works
- [ ] Login flow works
- [ ] Dashboard loads correctly
- [ ] Offer wall loads
- [ ] Cashout flow works
- [ ] Admin panel accessible
- [ ] Push notifications sending
- [ ] Sentry receiving errors (if any)
- [ ] Better Uptime checks passing

### Mobile Deploy (T+2h)
- [ ] iOS TestFlight build submitted
- [ ] Android internal testing build submitted
- [ ] Both builds install and work
- [ ] Push notifications working
- [ ] Biometric auth working

### Monitoring (T+24h)
- [ ] No crash spikes
- [ ] No error spikes
- [ ] No performance degradation
- [ ] User signups trending normally
- [ ] Cashouts processing normally
- [ ] No fraud flags

---

## POST-LAUNCH CHECKLIST

### Week 1
- [ ] Monitor Sentry for errors daily
- [ ] Monitor Better Uptime for downtime
- [ ] Review user feedback
- [ ] Fix any critical bugs
- [ ] Respond to App Store reviews
- [ ] Respond to Google Play reviews

### Week 2
- [ ] Review analytics (signups, offers, cashouts)
- [ ] A/B test landing page elements
- [ ] Optimize underperforming flows
- [ ] Plan Sprint 6 features

### Month 1
- [ ] Revenue analysis
- [ ] User retention analysis
- [ ] Fraud analysis
- [ ] Performance optimization
- [ ] Feature roadmap update

---

## EMERGENCY CONTACTS

| Role | Name | Contact |
|------|------|---------|
| Backend Lead | TBD | TBD |
| Frontend Dev | TBD | TBD |
| Mobile Dev | TBD | TBD |
| DevOps | TBD | TBD |
| QA/Security | TBD | TBD |

---

## ROLLBACK PROCEDURE

1. **Vercel:** Revert to previous deployment in Vercel dashboard
2. **Firebase Functions:** `firebase deploy --only functions --force` with previous version
3. **Firestore Rules:** `firebase deploy --only firestore:rules` with previous version
4. **Database:** Restore from backup (if needed)
5. **Mobile:** Submit previous build to TestFlight/Google Play

---

## SUCCESS METRICS (First 30 Days)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Signups | 1,000+ | Firebase Auth |
| Daily Active Users | 200+ | Analytics |
| Offer Completion Rate | 30%+ | RapidoReach dashboard |
| Cashout Success Rate | 99%+ | Cashout logs |
| Crash Rate | <1% | Sentry |
| App Store Rating | 4.5+ | App Store Connect |
| Google Play Rating | 4.5+ | Google Play Console |
| Support Response Time | <24h | Email inbox |

---

*End of LAUNCH_CHECKLIST.md — Final checklist derived from all 9 documents. Use this on launch day.*
