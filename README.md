# TapCash

**Premium Rewards Platform** — Complete verified offers, track every step, and cash out when rewards clear.

---

## Quick Start

```bash
npm install
cp .env.example .env.local  # Fill in your Firebase + API keys
npm run dev                  # http://localhost:3000
```

## GitHub Secrets Required

For CI/CD to work, set these in **Settings > Secrets and variables > Actions**:

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `FIREBASE_PROJECT_ID` | Firebase Admin Project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin Client Email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin Private Key |
| `VERCEL_TOKEN` | Vercel API Token |
| `FIREBASE_TOKEN` | Firebase CLI Token |
| `SNYK_TOKEN` | Snyk Security Token |
| `SLACK_WEBHOOK` | Slack webhook for notifications |
| `EMAIL_USERNAME` | CI email notifications |
| `EMAIL_PASSWORD` | CI email password |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.0.0-canary.5 (App Router) |
| Language | TypeScript |
| Auth | Firebase Auth + Admin SDK + jose session JWTs |
| Database | Firestore (with seed-data fallback) |
| Payments | PayPal, Interac e-Transfer, Tremendous Gift Cards |
| Offers | RapidoReach offerwall |
| UI | Tailwind CSS v4, shadcn/ui, Framer Motion, Lucide React |
| Testing | Jest (93 tests, 7 suites) |
| CI/CD | GitHub Actions → Vercel |
| Mobile | React Native / Expo (in /mobile/) — Sprint 1 API wiring + Sprint 2 push notifications/polish landed; Track 3 asset/config hardening completed 2026-08-07, with EAS Android + real-device verification still pending external access |

## Project Structure

```
src/
├── app/             # Next.js App Router pages + API routes
├── components/      # Reusable UI components (Navbar, Footer, ui/)
├── hooks/           # Custom hooks (usePolling)
├── context/         # React context providers (AuthContext)
├── lib/             # Utilities & services
└── middleware/      # Legacy rate-limit config

middleware.ts        # Root Edge middleware (route protection)
mobile/              # Expo / React Native app (npm workspace)
functions/           # Firebase Functions
packages/tokens/     # Design tokens (Aurora)
shared/              # Code shared by web and mobile
src-electron/        # Electron desktop wrapper
scripts/             # verify.sh / verify.ps1 (CI gate), audit gate, seeding
audits/              # Dated audits (YYYY-MM-DD_<Agent>_<Scope>_Audit.md)

docs/
├── START_HERE.md    # Current state, launch blockers, how to pick up the project
├── README.md        # Index of every doc
├── guides/          # Developer, API, deployment, mobile build, user guides
├── operations/      # Launch/production checklists, security ops, payout status
├── status/          # June 2026 status snapshots (GROUNDTRUTH, TODO, coverage)
├── governance/      # Branch policy, deferred-work register
├── plans/           # Web, mobile and UI/UX plans and proposals
├── superpowers/     # Agent implementation plans
└── archive/         # Finished sprint reports, retired configs (history only)
```

## Key Features

- ✅ Firebase Auth + session JWTs (jose-verified HTTP-only cookies)
- ✅ RapidoReach offerwall with signed iframe + IP-whitelisted postback
- ✅ Fraud detection (VPN, bot, IP reputation, rate limiting, engagement lock, destination lock)
- ✅ Admin panel (8 sections: dashboard, users, transactions, offers, fraud, multipliers, promo codes)
- ✅ Cashout requests with anti-fraud → admin-only payout processing (PayPal, Interac, Tremendous)
- ✅ Real-time features (polling via usePolling hook — 30s activity, 60s leaderboard)
- ✅ 93 tests across 7 suites (lib + API route pure functions)
- ✅ Session-based route protection (middleware.ts at root)
- ✅ Firestore content APIs with 5-minute cache + seed-data fallback
- ✅ 10 content pages (games, how-it-works, rewards, leaderboard, blog, about, careers, contact, help, faq)
- ✅ Mobile: React Native / Expo with live backend API wiring, Aurora tokens, real icon/splash/offer assets, and cashout/auth/push/deep-link code paths hardened

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint check |
| `npm test` | Run Jest tests (93 tests, 7 suites) |
| `npm run test:watch` | Watch mode tests |
| `npx tsc --noEmit` | TypeScript type-check |
| `npx tsx scripts/seed-firestore.ts` | Seed Firestore with initial data |

## Deployment

See [docs/guides/DEPLOYMENT_GUIDE.md](./docs/guides/DEPLOYMENT_GUIDE.md) for full deployment instructions.

## Documentation

All documentation is in the [`docs/`](./docs/) directory. **Start with [docs/START_HERE.md](./docs/START_HERE.md)**: current state, launch blockers and next steps. The full index is [docs/README.md](./docs/README.md). [GROUNDTRUTH.md](./docs/status/GROUNDTRUTH.md) describes the architecture as of June 2026.

- [API Reference](./docs/guides/API_DOCUMENTATION.md)
- [Deployment Guide](./docs/guides/DEPLOYMENT_GUIDE.md)
- [Developer Guide](./docs/guides/DEVELOPER_GUIDE.md)
- [Payout Status](./docs/operations/PAYOUT_STATUS.md)
- [Test Coverage Report](./docs/status/TEST_COVERAGE_REPORT.md)
- [Production Checklist](./docs/operations/PRODUCTION_READINESS_CHECKLIST.md)
