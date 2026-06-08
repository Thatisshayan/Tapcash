# TapCash

**Premium Rewards Platform** — Complete verified offers, track every step, and cash out when rewards clear.

---

## Quick Start

```bash
npm install
cp .env.example .env.local  # Fill in your Firebase + API keys
npm run dev                  # http://localhost:3000
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth | Firebase Authentication |
| Database | Firestore (via Firebase Admin) |
| Payments | PayPal, Interac e-Transfer, Tremendous Gift Cards |
| Offers | Lootably, RapidoReach |
| UI | Tailwind CSS 4, Framer Motion, Lucide React |
| Animation | Framer Motion |
| Testing | Jest, Playwright |
| CI/CD | GitHub Actions → Vercel |
| Mobile | React Native / Expo (in /mobile/) |

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # Reusable UI components
├── context/      # React context providers
├── lib/          # Utilities & services
└── styles/       # Theme & premium CSS

docs/             # Full documentation
├── API_DOCUMENTATION.md
├── DEPLOYMENT_GUIDE.md
├── DEVELOPER_GUIDE.md
├── USER_GUIDE.md
├── SECURITY_DOCUMENTATION.md
└── ...
```

## Key Features

- ✅ Firebase Auth + email verification
- ✅ Ledger-backed balance system
- ✅ Lootably & RapidoReach offerwalls
- ✅ Fraud detection (VPN, bot, device fingerprinting, rate limiting)
- ✅ Admin panel (dashboard, users, transactions, offers, fraud)
- ✅ Payouts (PayPal, Interac, Tremendous gift cards)
- ✅ Real-time updates (Firestore listeners)
- ✅ PWA with push notifications
- ✅ Premium Model-U design system
- ✅ WCAG 2.1 AA accessibility
- ✅ Full test suite (Jest + Playwright)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint check |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Watch mode tests |

## Deployment

See [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for full deployment instructions.

## Documentation

All documentation is in the [`docs/`](./docs/) directory:

- [API Reference](./docs/API_DOCUMENTATION.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Security Documentation](./docs/SECURITY_DOCUMENTATION.md)
- [Production Checklist](./docs/PRODUCTION_CHECKLIST.md)
