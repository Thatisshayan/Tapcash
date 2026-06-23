# 🚀 TapCash Production Deployment Guide

Complete guide for deploying TapCash to production on Vercel with Firebase.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Production Setup](#firebase-production-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Environment Variables](#environment-variables)
5. [Domain Configuration](#domain-configuration)
6. [SSL & Security](#ssl--security)
7. [CDN Configuration](#cdn-configuration)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Monitoring Setup](#monitoring-setup)
10. [Rollback Procedure](#rollback-procedure)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Firebase CLI installed (`npm install -g firebase-tools`)
- ✅ Vercel CLI installed (`npm install -g vercel`)
- ✅ Git repository set up
- ✅ All tests passing locally
- ✅ Production Firebase project created
- ✅ Vercel account created

## Firebase Production Setup

### 1. Create Production Firebase Project

```bash
# Login to Firebase
firebase login

# Create new project (or use existing)
firebase projects:create tapcash-production

# Select the project
firebase use tapcash-production
```

### 2. Enable Required Services

In Firebase Console (https://console.firebase.google.com):

1. **Authentication**
   - Enable Email/Password authentication
   - Enable Google Sign-In
   - Configure authorized domains (add your production domain)

2. **Firestore Database**
   - Create database in production mode
   - Deploy security rules: `firebase deploy --only firestore:rules`
   - Create indexes: `firebase deploy --only firestore:indexes`

3. **Cloud Functions**
   - Enable Cloud Functions
   - Deploy functions: `firebase deploy --only functions`

4. **Storage** (if using)
   - Enable Cloud Storage
   - Deploy storage rules

### 3. Configure Firebase Admin SDK

```bash
# Generate service account key
# Go to: Project Settings > Service Accounts > Generate New Private Key

# Save the JSON file securely (DO NOT commit to git)
# You'll need this for FIREBASE_SERVICE_ACCOUNT_KEY environment variable
```

### 4. Set Up Firestore Collections

Required collections:
- `users` - User accounts and profiles
- `transactions` - All financial transactions
- `offers` - Available offers
- `payouts` - Payout requests
- `fraud_alerts` - Fraud detection alerts
- `admin_logs` - Admin action logs
- `blocked_ips` - Blocked IP addresses
- `error_logs` - Application error logs

### 5. Create Admin User

```bash
# Run the admin setup script
node set_admin.js YOUR_ADMIN_EMAIL@example.com
```

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project

```bash
# From project root
vercel link
```

### 4. Configure Project Settings

In `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 5. Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or use the deployment script
npm run deploy
```

## Environment Variables

### Required Environment Variables

Set these in Vercel Dashboard (Settings > Environment Variables):

#### Firebase Configuration
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Firebase Admin SDK
```bash
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

#### Payment Providers
```bash
# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live

# Tremendous (Gift Cards)
TREMENDOUS_API_KEY=your_tremendous_api_key
TREMENDOUS_MODE=production

# Interac (Canada)
INTERAC_API_KEY=your_interac_api_key
INTERAC_API_SECRET=your_interac_secret
```

#### Security
```bash
SESSION_SECRET=your_secure_random_string_min_32_chars
ADMIN_UIDS=comma,separated,firebase,uids
```

#### Offerwall
```bash
RAPIDOREACH_APP_ID=your_app_id
RAPIDOREACH_APP_KEY=your_app_key
RAPIDOREACH_APP_SECRET=your_app_secret
RAPIDOREACH_TRANSACTION_KEY=your_transaction_key
```

#### Email Service
```bash
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@tapcash.com
# OR
RESEND_API_KEY=your_resend_api_key
```

#### Rate Limiting (Optional — recommended for production)
```bash
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

#### Monitoring (Optional)
```bash
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

*(rate limiting env vars are listed above under "Rate Limiting")*

### Setting Environment Variables

```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY production

# Or use the Vercel Dashboard
# https://vercel.com/your-team/tapcash/settings/environment-variables
```

## Domain Configuration

### 1. Add Custom Domain

In Vercel Dashboard:
1. Go to Settings > Domains
2. Add your domain: `tapcash.com`
3. Add www subdomain: `www.tapcash.com`

### 2. Configure DNS

Add these DNS records at your domain registrar:

```
Type    Name    Value                           TTL
A       @       76.76.21.21                     3600
CNAME   www     cname.vercel-dns.com            3600
```

### 3. Verify Domain

Wait for DNS propagation (can take up to 48 hours, usually much faster).

Verify with:
```bash
dig tapcash.com
dig www.tapcash.com
```

## SSL & Security

### 1. SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

- Certificates auto-renew
- HTTPS enforced by default
- HTTP automatically redirects to HTTPS

### 2. Security Headers

Configure in `next.config.ts`:

```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### 3. Content Security Policy

Add CSP headers to prevent XSS attacks:

```typescript
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' *.firebase.com *.googleapis.com;"
}
```

## CDN Configuration

Vercel provides global CDN automatically:

### 1. Edge Network

- Automatic edge caching
- 70+ global edge locations
- Smart routing to nearest edge

### 2. Cache Configuration

In `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

### 3. Image Optimization

Next.js Image Optimization is enabled by default:

```typescript
images: {
  domains: ['firebasestorage.googleapis.com'],
  formats: ['image/avif', 'image/webp'],
}
```

## Post-Deployment Verification

### 1. Health Checks

```bash
# Check homepage
curl -I https://tapcash.com

# Check API health
curl https://tapcash.com/api/health

# Check authentication
curl https://tapcash.com/api/auth/status
```

### 2. Functionality Tests

- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Offers load correctly
- [ ] Transactions process
- [ ] Payouts work
- [ ] Admin panel accessible
- [ ] Fraud detection active

### 3. Performance Tests

```bash
# Run Lighthouse audit
npx lighthouse https://tapcash.com --view

# Check Core Web Vitals
# Use PageSpeed Insights: https://pagespeed.web.dev/
```

### 4. Security Scan

```bash
# Check SSL
curl -I https://tapcash.com | grep -i strict

# Check security headers
curl -I https://tapcash.com | grep -i x-frame

# Run security audit
npm audit
```

## Monitoring Setup

### 1. Vercel Analytics

Enable in Vercel Dashboard:
- Go to Analytics tab
- Enable Web Analytics
- Enable Speed Insights

### 2. Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs

# Configure in sentry.client.config.js and sentry.server.config.js
```

### 3. Uptime Monitoring

Set up monitoring with:
- UptimeRobot (https://uptimerobot.com)
- Pingdom (https://www.pingdom.com)
- StatusCake (https://www.statuscake.com)

Monitor these endpoints:
- `https://tapcash.com` (Homepage)
- `https://tapcash.com/api/health` (API Health)

### 4. Firebase Monitoring

Enable in Firebase Console:
- Performance Monitoring
- Crashlytics
- Analytics

## Rollback Procedure

### Quick Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Manual Rollback

1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Find the last working deployment
4. Click "Promote to Production"

### Emergency Rollback

```bash
# Redeploy last known good commit
git checkout [last-good-commit]
vercel --prod
```

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables configured
- [ ] Firebase production project set up
- [ ] Admin user created
- [ ] Security rules deployed
- [ ] Payment providers configured
- [ ] Email service configured
- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Team notified of deployment

## Post-Deployment

After successful deployment:

1. **Announce**: Notify team and stakeholders
2. **Monitor**: Watch error rates and performance for 24 hours
3. **Test**: Run full regression tests
4. **Document**: Update changelog and release notes
5. **Backup**: Ensure automated backups are running

## Support

For deployment issues:

- **Vercel Support**: https://vercel.com/support
- **Firebase Support**: https://firebase.google.com/support
- **Documentation**: Check this guide and official docs
- **Team**: Contact DevOps team

---

## Quick Reference

### Common Commands

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]

# Rollback
vercel rollback [deployment-url]

# Set environment variable
vercel env add [NAME] production

# Pull environment variables
vercel env pull
```

### Important URLs

- Production: https://tapcash.com
- Vercel Dashboard: https://vercel.com/dashboard
- Firebase Console: https://console.firebase.google.com
- Admin Panel: https://tapcash.com/admin/dashboard

---

**Last Updated**: 2026-06-07
**Version**: 1.0.0
**Maintained By**: TapCash DevOps Team