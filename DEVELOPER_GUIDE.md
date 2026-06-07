# 🛠️ TapCash Developer Guide

Complete guide for developers working on TapCash.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Tech Stack](#tech-stack)
6. [Development Workflow](#development-workflow)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Process](#deployment-process)
9. [Contributing Guidelines](#contributing-guidelines)
10. [Best Practices](#best-practices)

---

## Project Overview

TapCash is a reward platform built with Next.js 14, Firebase, and TypeScript. Users complete offers (games, surveys, shopping) to earn money, which they can cash out via PayPal, Interac, or gift cards.

### Key Features

- 🔐 Secure authentication with Firebase
- 💰 Multiple payout methods (PayPal, Interac, Tremendous)
- 🛡️ Advanced fraud detection
- 📊 Real-time analytics
- 👨‍💼 Comprehensive admin panel
- 📱 Mobile-responsive design
- 🚀 High performance (Lighthouse 95+)

---

## Architecture

### High-Level Architecture

```
┌─────────────┐
│   Client    │ (Next.js 14 App Router)
│  (Browser)  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Vercel    │ (Hosting + Edge Functions)
│   (CDN)     │
└──────┬──────┘
       │
       ├──────→ ┌──────────────┐
       │        │   Firebase   │ (Auth + Firestore)
       │        └──────────────┘
       │
       ├──────→ ┌──────────────┐
       │        │    PayPal    │ (Payments)
       │        └──────────────┘
       │
       ├──────→ ┌──────────────┐
       │        │   Interac    │ (Canadian Payments)
       │        └──────────────┘
       │
       └──────→ ┌──────────────┐
                │  Tremendous  │ (Gift Cards)
                └──────────────┘
```

### Data Flow

```
User Action → Client → API Route → Firebase → Response
                ↓
         Fraud Detection
                ↓
         Transaction Log
                ↓
         Analytics
```

---

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Firebase CLI
- Vercel CLI (optional)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/tapcash.git
cd tapcash

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure Firebase
firebase login
firebase use --add

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local` with:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Payment Providers
PAYPAL_CLIENT_ID=your_paypal_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
TREMENDOUS_API_KEY=your_tremendous_key
INTERAC_API_KEY=your_interac_key

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Email
SENDGRID_API_KEY=your_sendgrid_key
```

---

## Project Structure

```
tapcash/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── public/
│   ├── images/            # Static images
│   └── manifest.json      # PWA manifest
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin pages
│   │   ├── dashboard/    # User dashboard
│   │   └── layout.tsx    # Root layout
│   ├── components/        # React components
│   ├── context/          # React context
│   ├── lib/              # Utilities & services
│   │   ├── firebase.ts   # Firebase client
│   │   ├── firebaseAdmin.ts
│   │   ├── paypal.ts     # PayPal integration
│   │   ├── interac.ts    # Interac integration
│   │   ├── tremendous.ts # Gift card integration
│   │   ├── antiFraud.ts  # Fraud detection
│   │   ├── monitoring.ts # Monitoring service
│   │   └── validation/   # Input validation
│   └── middleware/        # Next.js middleware
├── functions/             # Firebase Cloud Functions
├── tests/                # Test files
├── docs/                 # Documentation
└── package.json
```

### Key Directories

#### `/src/app`
Next.js 14 App Router pages and API routes.

#### `/src/components`
Reusable React components:
- `BalanceCard.tsx` - User balance display
- `OfferCard.tsx` - Offer display
- `Header.tsx` - Navigation
- `TapScoreIndicator.tsx` - TapScore display

#### `/src/lib`
Core business logic and integrations:
- Authentication
- Payment processing
- Fraud detection
- Database operations
- External API integrations

#### `/src/context`
React Context providers:
- `AuthContext.tsx` - Authentication state

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Cloud Functions**: Firebase Functions

### Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Monitoring**: Vercel Analytics + Custom

### Payment Providers
- **PayPal**: REST API v2
- **Interac**: e-Transfer API
- **Tremendous**: Gift Card API

### Development Tools
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow coding standards and best practices.

### 3. Run Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- OfferCard.test.tsx

# Run with coverage
npm test -- --coverage
```

### 4. Lint & Format

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

Commit message format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

### 6. Push & Create PR

```bash
git push origin feature/your-feature-name
```

Create Pull Request on GitHub with:
- Clear description
- Screenshots (if UI changes)
- Test results
- Breaking changes (if any)

### 7. Code Review

- Address review comments
- Update PR as needed
- Get approval from 2+ reviewers

### 8. Merge

- Squash and merge to main
- Delete feature branch
- Deploy automatically via CI/CD

---

## Testing Strategy

### Unit Tests

Test individual functions and components.

```typescript
// Example: OfferCard.test.tsx
import { render, screen } from '@testing-library/react';
import OfferCard from '@/components/OfferCard';

describe('OfferCard', () => {
  it('renders offer details', () => {
    const offer = {
      id: '1',
      name: 'Test Offer',
      reward: 5.00,
      difficulty: 'easy'
    };
    
    render(<OfferCard offer={offer} />);
    
    expect(screen.getByText('Test Offer')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test API endpoints and database operations.

```typescript
// Example: payout-flow.test.ts
describe('Payout Flow', () => {
  it('processes PayPal payout', async () => {
    const result = await processPayPalPayout({
      userId: 'test_user',
      amount: 25.00,
      email: 'user@paypal.com'
    });
    
    expect(result.status).toBe('completed');
    expect(result.transactionId).toBeDefined();
  });
});
```

### E2E Tests

Test complete user flows (optional, using Playwright).

```typescript
// Example: signup-flow.spec.ts
test('user can sign up and complete offer', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign Up');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'SecurePass123!');
  await page.click('button[type=submit]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

---

## Deployment Process

### Automatic Deployment

Pushes to `main` branch automatically deploy to production via GitHub Actions.

### Manual Deployment

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Deployment Checklist

Before deploying:
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Security rules updated
- [ ] Performance tested
- [ ] Documentation updated

### Rollback

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

---

## Contributing Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Component Guidelines

```typescript
// Good component structure
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export default function MyComponent({ title, onSubmit }: Props) {
  // Hooks at top
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = () => {
    // ...
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### API Route Guidelines

```typescript
// Good API route structure
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const user = await authenticate(request);
    
    // 2. Validate input
    const data = await request.json();
    const validated = schema.parse(data);
    
    // 3. Process
    const result = await processData(validated);
    
    // 4. Return response
    return NextResponse.json(result);
    
  } catch (error) {
    // 5. Handle errors
    return handleError(error);
  }
}
```

### Database Guidelines

- Use transactions for multi-step operations
- Add indexes for frequently queried fields
- Validate data before writing
- Use batch operations when possible
- Handle errors gracefully

### Security Guidelines

- Never expose API keys in client code
- Validate all user input
- Use parameterized queries
- Implement rate limiting
- Log security events
- Follow OWASP guidelines

---

## Best Practices

### Performance

- Use Next.js Image component
- Implement code splitting
- Lazy load components
- Optimize bundle size
- Cache API responses
- Use CDN for static assets

### Accessibility

- Use semantic HTML
- Add ARIA labels
- Support keyboard navigation
- Ensure color contrast
- Test with screen readers

### SEO

- Add meta tags
- Use proper heading hierarchy
- Implement structured data
- Create sitemap
- Optimize page speed

### Error Handling

```typescript
// Good error handling
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  // Log error
  console.error('Operation failed:', error);
  
  // Track in monitoring
  monitoring.logError(error);
  
  // Return user-friendly message
  return {
    error: 'Something went wrong. Please try again.'
  };
}
```

### Logging

```typescript
// Use monitoring service
import { monitoring } from '@/lib/monitoring';

// Log errors
monitoring.logError(error, context, 'high');

// Track events
monitoring.trackEvent('user_action', { action: 'signup' });

// Track performance
const timer = new PerformanceTimer('api_call');
// ... operation ...
timer.end();
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Linting
npm run lint            # Check code
npm run lint:fix        # Fix issues
npm run format          # Format code

# Type Checking
npm run type-check      # Check TypeScript

# Database
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# Deployment
vercel                  # Deploy preview
vercel --prod          # Deploy production
```

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

### Internal Docs
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Security Documentation](./SECURITY_DOCUMENTATION.md)

### Tools
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Firebase Console](https://console.firebase.google.com)
- [GitHub Repository](https://github.com/your-org/tapcash)

---

## Getting Help

### Team Contacts
- **Tech Lead**: tech-lead@tapcash.com
- **DevOps**: devops@tapcash.com
- **Security**: security@tapcash.com

### Channels
- **Slack**: #tapcash-dev
- **Email**: dev@tapcash.com
- **Issues**: GitHub Issues

---

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Firebase Connection Issues**
```bash
# Re-authenticate
firebase logout
firebase login
firebase use --add
```

**Type Errors**
```bash
# Regenerate types
npm run type-check
```

**Tests Failing**
```bash
# Clear Jest cache
npm test -- --clearCache
npm test
```

---

**Happy Coding!** 🚀

---

**Last Updated**: 2026-06-07  
**Version**: 1.0.0  
**Maintained By**: TapCash Engineering Team