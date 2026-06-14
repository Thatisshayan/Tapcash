# TapCash Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm run test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code review completed
- [ ] Security audit completed

### Database
- [ ] Database migrations applied
- [ ] Database backups configured
- [ ] Connection pooling configured
- [ ] Performance indexes created
- [ ] Database monitoring enabled

### Security
- [ ] All environment variables set
- [ ] API keys secured
- [ ] HTTPS/SSL configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation verified
- [ ] Password hashing verified
- [ ] Admin access restricted

### Infrastructure
- [ ] Server capacity verified
- [ ] Load balancing configured
- [ ] CDN configured
- [ ] Monitoring and alerting set up
- [ ] Logging configured
- [ ] Backup strategy in place
- [ ] Disaster recovery plan ready

### Documentation
- [ ] API documentation complete
- [ ] Deployment runbook created
- [ ] Incident response plan ready
- [ ] Team trained on operations

---

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/tapcash

# Authentication
JWT_SECRET=your-secret-key-here
OAUTH_SERVER_URL=https://api.manus.im

# API Configuration
VITE_APP_ID=your-app-id
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Payment Processors
PAYPAL_CLIENT_ID=your-paypal-id
PAYPAL_CLIENT_SECRET=your-paypal-secret
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_PUBLIC_KEY=your-stripe-public-key

# Offerwall Providers
ADGEM_API_KEY=your-adgem-key
ADGATE_API_KEY=your-adgate-key
LOOTABLY_API_KEY=your-lootably-key
TOROX_API_KEY=your-torox-key
BITLABS_API_KEY=your-bitlabs-key
CPX_RESEARCH_API_KEY=your-cpx-key

# Email Service
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@tapcash.io

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key

# Feature Flags
ENABLE_FRAUD_DETECTION=true
ENABLE_VPN_DETECTION=true
ENABLE_DEVICE_FINGERPRINTING=true
```

---

## Deployment Steps

### 1. Prepare Environment

```bash
# Clone repository
git clone https://github.com/yourusername/tapcash.git
cd tapcash

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm run test
```

### 2. Database Setup

```bash
# Create database
createdb tapcash

# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed

# Verify schema
npm run db:check
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env.production

# Edit with production values
nano .env.production

# Verify all required variables are set
npm run env:check
```

### 4. Deploy Application

#### Option A: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link project
railway link

# Deploy
railway up
```

#### Option B: Docker

```bash
# Build Docker image
docker build -t tapcash:latest .

# Run container
docker run -d \
  --name tapcash \
  -p 3000:3000 \
  --env-file .env.production \
  tapcash:latest

# Verify running
docker ps
```

#### Option C: Manual Server

```bash
# SSH into server
ssh user@server.com

# Clone repository
git clone https://github.com/yourusername/tapcash.git
cd tapcash

# Install dependencies
npm install --production

# Build
npm run build

# Start with PM2
pm2 start "npm start" --name tapcash

# Save PM2 config
pm2 save
```

### 5. Post-Deployment Verification

```bash
# Check health endpoint
curl https://tapcash.io/api/health

# Verify database connection
npm run db:check

# Run smoke tests
npm run test:smoke

# Check logs
npm run logs:view

# Monitor performance
npm run monitor:start
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Database health
SELECT 1;

# API health
GET /api/health

# Cache health
PING

# Queue health
GET /api/queue/status
```

### Performance Monitoring

Monitor these metrics:

- **Response Time**: Target < 200ms p95
- **Error Rate**: Target < 0.1%
- **Database Queries**: Target < 100ms p95
- **Memory Usage**: Target < 500MB
- **CPU Usage**: Target < 60%

### Log Monitoring

Monitor these log patterns:

- Authentication failures
- Database errors
- Payment processor errors
- Fraud detection alerts
- Admin actions

### Backup Strategy

```bash
# Daily database backup
0 2 * * * pg_dump tapcash | gzip > /backups/tapcash-$(date +\%Y\%m\%d).sql.gz

# Weekly full backup
0 3 * * 0 tar -czf /backups/tapcash-full-$(date +\%Y\%m\%d).tar.gz /app /data

# Keep 30 days of backups
find /backups -name "tapcash-*.sql.gz" -mtime +30 -delete
```

---

## Scaling Strategy

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or AWS ELB
2. **Multiple Instances**: Deploy 3+ app servers
3. **Database Replication**: Set up read replicas
4. **Cache Layer**: Add Redis for session/cache
5. **Message Queue**: Use RabbitMQ for async jobs

### Vertical Scaling

1. **Increase CPU**: 2 → 4 vCPU
2. **Increase RAM**: 2GB → 8GB
3. **Upgrade Database**: Larger instance type
4. **Optimize Queries**: Add indexes, optimize slow queries

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_payouts_user_id ON payouts(user_id);
CREATE INDEX idx_fraud_flags_user_id ON fraud_flags(user_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM transactions WHERE user_id = $1;
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
SELECT count(*) FROM pg_stat_activity;
```

### High Memory Usage

```bash
# Check Node.js heap
node --max-old-space-size=4096 server.js

# Monitor memory
watch -n 1 'ps aux | grep node'
```

### Slow Queries

```bash
# Enable query logging
SET log_min_duration_statement = 1000;

# Find slow queries
SELECT query, mean_time FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

### Payment Processor Issues

```bash
# Check provider status
curl https://api.paypal.com/v1/health

# Verify API keys
npm run verify:api-keys

# Test payment processor
npm run test:payment-processor
```

---

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous version
git revert HEAD

# Rebuild and redeploy
npm run build
npm run deploy

# Or rollback database
pg_restore -d tapcash /backups/tapcash-previous.sql.gz
```

---

## Security Hardening

### HTTPS/SSL

```bash
# Generate SSL certificate
certbot certonly --standalone -d tapcash.io

# Configure Nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/tapcash.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tapcash.io/privkey.pem;
}
```

### Rate Limiting

```bash
# Configure rate limits
npm run config:rate-limits

# Limits:
# - Auth endpoints: 5 requests/minute
# - API endpoints: 100 requests/minute
# - Admin endpoints: 50 requests/minute
```

### DDoS Protection

```bash
# Enable CloudFlare
# - DDoS protection
# - WAF rules
# - Rate limiting
```

---

## Performance Optimization

### Caching Strategy

```bash
# Redis cache for:
# - User sessions (TTL: 24h)
# - Offer listings (TTL: 1h)
# - User balances (TTL: 5m)
# - Admin KPIs (TTL: 15m)
```

### Database Optimization

```bash
# Connection pooling
PGBOUNCER_POOL_MODE=transaction
PGBOUNCER_MAX_CLIENT_CONN=1000

# Query optimization
- Add indexes for frequently queried columns
- Use prepared statements
- Implement query caching
```

### API Optimization

```bash
# Compression
gzip on;
gzip_types text/plain application/json;

# Pagination
- Default limit: 20
- Max limit: 100

# Filtering
- Index on status, type, created_at
```

---

## Incident Response

### Critical Issues

1. **Database Down**
   - Switch to read replica
   - Restore from backup
   - Notify users

2. **Payment Processor Down**
   - Queue transactions
   - Retry automatically
   - Manual processing if needed

3. **Security Breach**
   - Isolate affected systems
   - Rotate credentials
   - Notify users
   - Investigate root cause

### Communication

- **Status Page**: https://status.tapcash.io
- **Email Alerts**: ops@tapcash.io
- **Slack Alerts**: #tapcash-alerts
- **PagerDuty**: On-call rotation

---

## Maintenance Windows

### Scheduled Maintenance

- **Frequency**: Monthly (2nd Sunday)
- **Duration**: 2-4 hours
- **Window**: 2-6 AM UTC
- **Notification**: 1 week advance notice

### Maintenance Tasks

- Database optimization
- Security patches
- Dependency updates
- Performance tuning
- Backup verification

---

## Success Metrics

Track these metrics post-deployment:

- **Uptime**: Target 99.9%
- **Response Time**: p95 < 200ms
- **Error Rate**: < 0.1%
- **User Satisfaction**: > 4.5/5
- **Revenue**: On target
- **Fraud Rate**: < 1%

---

## Support & Escalation

- **Level 1**: Automated monitoring & alerts
- **Level 2**: On-call engineer (1st response: 15min)
- **Level 3**: Engineering team (critical issues)
- **Level 4**: Vendor support (infrastructure)

---

## Post-Launch

### Week 1
- Monitor all metrics closely
- Address any critical issues
- Gather user feedback
- Optimize based on real usage

### Month 1
- Performance optimization
- Security hardening
- Feature improvements
- User onboarding refinement

### Ongoing
- Regular security audits
- Performance monitoring
- User feedback integration
- Continuous improvement

---

**Deployment Owner**: [Your Name]
**Last Updated**: [Date]
**Next Review**: [Date + 30 days]
