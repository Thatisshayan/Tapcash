# SECURITY_OPS.md — Manual Security Operations

**Created:** July 6, 2026  
**Sprint:** Sprint 1 — Security Criticals  
**Purpose:** Step-by-step instructions for manual security operations that require external dashboard/console access

---

## 1. Purge Compromised Firebase Key from Git History

### Prerequisites
- Install `git-filter-repo`: `pip install git-filter-repo`
- Ensure you have admin access to the GitHub repository
- Notify all team members to re-clone after force push

### Steps

```bash
# 1. Create a fresh clone for the rewrite
git clone --mirror https://github.com/YOUR_ORG/tapcash.git tapcash-rewrite
cd tapcash-rewrite

# 2. Find the compromised key file path in history
git log --all --full-history -- "**/serviceAccountKey.json" "**/firebase-admin*.json"

# 3. Remove the file from all history
git filter-repo --path path/to/serviceAccountKey.json --invert-paths

# 4. Force push to all branches and tags
git push origin --force --all
git push origin --force --tags

# 5. All team members must re-clone:
# git clone https://github.com/YOUR_ORG/tapcash.git
```

### Post-Purge
- [ ] Verify key file is gone: `git log --all --full-history -- "**/serviceAccountKey.json"`
- [ ] Delete old key in Firebase Console → Project Settings → Service Accounts
- [ ] Generate new service account key
- [ ] Add new key to Vercel as `FIREBASE_PRIVATE_KEY` env var
- [ ] Verify deployment works with new key

---

## 2. Rotate All API Keys

### 2.1 RapidoReach
1. Log in to [RapidoReach Dashboard](https://rapidoreach.com/dashboard)
2. Navigate to App Settings → API Keys
3. Click "Regenerate" for:
   - `RAPIDOREACH_APP_KEY`
   - `RAPIDOREACH_APP_SECRET`
   - `RAPIDOREACH_TRANSACTION_KEY`
4. Update Vercel environment variables:
   ```bash
   vercel env add RAPIDOREACH_APP_KEY production
   vercel env add RAPIDOREACH_APP_SECRET production
   vercel env add RAPIDOREACH_TRANSACTION_KEY production
   ```
5. Redeploy: `vercel --prod`

### 2.2 ProxyCheck
1. Log in to [ProxyCheck.io Dashboard](https://proxycheck.io/dashboard/)
2. Navigate to API Keys
3. Delete old key, generate new key
4. Update Vercel:
   ```bash
   vercel env add PROXYCHECK_API_KEY production
   ```
5. Redeploy: `vercel --prod`

### 2.3 Resend (Email)
1. Log in to [Resend Dashboard](https://resend.com/api-keys)
2. Navigate to API Keys
3. Revoke old key, create new key
4. Update Vercel:
   ```bash
   vercel env add RESEND_API_KEY production
   ```
5. Redeploy: `vercel --prod`

### 2.4 PayPal
1. Log in to [PayPal Developer](https://developer.paypal.com/dashboard/)
2. Navigate to Apps → Select App → Credentials
3. Regenerate Client Secret
4. Update Vercel:
   ```bash
   vercel env add PAYPAL_CLIENT_SECRET production
   ```
5. Redeploy: `vercel --prod`

### 2.5 Tremendous (Gift Cards)
1. Log in to [Tremendous Dashboard](https://www.tremendous.com/dashboard)
2. Navigate to Developers → API Keys
3. Revoke old key, generate new key
4. Update Vercel:
   ```bash
   vercel env add TREMENDOUS_API_KEY production
   ```
5. Redeploy: `vercel --prod`

### 2.6 Session Secret
Generate a new session secret and rotate:
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update Vercel
vercel env add SESSION_SECRET production

# Redeploy (invalidates all existing sessions)
vercel --prod
```

---

## 3. Verification Checklist

After all rotations:
- [ ] All Vercel env vars updated
- [ ] Production deployment successful
- [ ] Login flow works (new session secret)
- [ ] Offer wall postbacks work (new RapidoReach keys)
- [ ] Email sending works (new Resend key)
- [ ] VPN detection works (new ProxyCheck key)
- [ ] PayPal payouts work (new PayPal credentials)
- [ ] Gift card orders work (new Tremendous key)
- [ ] No errors in Sentry for 1 hour post-rotation

---

*End of SECURITY_OPS.md*
