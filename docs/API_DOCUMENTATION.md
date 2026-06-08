# 📡 TapCash API Documentation

Complete API reference for TapCash platform.

## Base URL

```
Production: https://tapcash.com/api
Development: http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using Firebase JWT tokens.

### Headers

```http
Authorization: Bearer <firebase_jwt_token>
Content-Type: application/json
```

### Getting a Token

```javascript
// Client-side (Firebase)
const token = await user.getIdToken();
```

---

## 📚 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Endpoints](#user-endpoints)
3. [Offer Endpoints](#offer-endpoints)
4. [Transaction Endpoints](#transaction-endpoints)
5. [Payout Endpoints](#payout-endpoints)
6. [Admin Endpoints](#admin-endpoints)
7. [Rate Limits](#rate-limits)
8. [Error Codes](#error-codes)

---

## Authentication Endpoints

### POST /api/auth/signup

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe",
  "referralCode": "ABC123" // optional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "userId": "user_123",
  "message": "Account created. Please verify your email."
}
```

**Errors:**
- `400` - Invalid email or password
- `409` - Email already exists
- `429` - Too many requests

---

### POST /api/auth/verify-email

Verify user email address.

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## User Endpoints

### GET /api/user/profile

Get current user profile.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "balance": 25.50,
  "totalEarned": 125.00,
  "totalWithdrawn": 99.50,
  "tapScore": 85,
  "status": "active",
  "emailVerified": true,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

### PATCH /api/user/profile

Update user profile.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "displayName": "Jane Doe",
  "phoneNumber": "+1234567890"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### GET /api/user/balance

Get user balance and earnings.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "balance": 25.50,
  "totalEarned": 125.00,
  "totalWithdrawn": 99.50,
  "pendingEarnings": 5.00,
  "availableForWithdrawal": 20.50
}
```

---

## Offer Endpoints

### GET /api/offers

Get available offers for user.

**Headers:** Requires authentication

**Query Parameters:**
- `category` (optional): Filter by category (games, surveys, shopping, apps, videos)
- `difficulty` (optional): Filter by difficulty (easy, medium, hard)
- `sort` (optional): Sort by (reward, difficulty, featured)

**Response:** `200 OK`
```json
{
  "offers": [
    {
      "id": "offer_123",
      "name": "Play Monopoly GO!",
      "description": "Reach level 10 in Monopoly GO!",
      "reward": 5.00,
      "category": "games",
      "difficulty": "easy",
      "featured": true,
      "estimatedTime": "15 minutes",
      "requirements": ["Install app", "Reach level 10"],
      "imageUrl": "https://...",
      "status": "available"
    }
  ],
  "total": 50,
  "page": 1,
  "perPage": 20
}
```

---

### GET /api/offers/:id

Get specific offer details.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "id": "offer_123",
  "name": "Play Monopoly GO!",
  "description": "Reach level 10 in Monopoly GO!",
  "reward": 5.00,
  "category": "games",
  "difficulty": "easy",
  "featured": true,
  "estimatedTime": "15 minutes",
  "requirements": ["Install app", "Reach level 10"],
  "instructions": "1. Download the app\n2. Create account\n3. Play until level 10",
  "imageUrl": "https://...",
  "status": "available",
  "completionRate": 0.75,
  "averageTime": "12 minutes"
}
```

---

### POST /api/offers/:id/start

Start an offer.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "success": true,
  "trackingId": "tracking_123",
  "startedAt": "2026-06-07T22:00:00Z",
  "expiresAt": "2026-06-08T22:00:00Z"
}
```

**Errors:**
- `400` - Offer already started
- `403` - User not eligible
- `404` - Offer not found

---

### POST /api/offers/:id/complete

Mark offer as completed.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "trackingId": "tracking_123",
  "proof": "screenshot_url" // optional
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "reward": 5.00,
  "newBalance": 30.50,
  "transactionId": "tx_123"
}
```

---

## Transaction Endpoints

### GET /api/transactions

Get user transaction history.

**Headers:** Requires authentication

**Query Parameters:**
- `type` (optional): Filter by type (earning, payout, bonus, refund)
- `status` (optional): Filter by status (pending, completed, failed)
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset

**Response:** `200 OK`
```json
{
  "transactions": [
    {
      "id": "tx_123",
      "type": "earning",
      "amount": 5.00,
      "status": "completed",
      "description": "Completed: Play Monopoly GO!",
      "timestamp": "2026-06-07T22:00:00Z",
      "offerId": "offer_123"
    }
  ],
  "total": 25,
  "hasMore": true
}
```

---

### GET /api/transactions/:id

Get specific transaction details.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "id": "tx_123",
  "type": "earning",
  "amount": 5.00,
  "status": "completed",
  "description": "Completed: Play Monopoly GO!",
  "timestamp": "2026-06-07T22:00:00Z",
  "completedAt": "2026-06-07T22:15:00Z",
  "offerId": "offer_123",
  "offerName": "Play Monopoly GO!",
  "metadata": {
    "completionTime": "15 minutes"
  }
}
```

---

## Payout Endpoints

### POST /api/payouts/request

Request a payout.

**Headers:** Requires authentication

**Request Body:**
```json
{
  "amount": 25.00,
  "method": "paypal", // paypal, interac, tremendous
  "details": {
    "email": "user@paypal.com" // for PayPal
    // or
    "email": "user@email.com", // for Interac
    "securityQuestion": "What is your favorite color?",
    "securityAnswer": "Blue"
    // or
    "giftCardType": "amazon", // for Tremendous
    "recipientEmail": "user@email.com"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "payoutId": "payout_123",
  "amount": 25.00,
  "method": "paypal",
  "status": "pending",
  "estimatedCompletion": "2026-06-08T22:00:00Z"
}
```

**Errors:**
- `400` - Invalid amount or method
- `402` - Insufficient balance
- `403` - Minimum payout not met ($5)
- `429` - Too many payout requests

---

### GET /api/payouts

Get user payout history.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "payouts": [
    {
      "id": "payout_123",
      "amount": 25.00,
      "method": "paypal",
      "status": "completed",
      "requestedAt": "2026-06-07T22:00:00Z",
      "completedAt": "2026-06-08T10:00:00Z",
      "details": {
        "email": "user@paypal.com"
      }
    }
  ],
  "total": 5
}
```

---

### GET /api/payouts/:id

Get specific payout details.

**Headers:** Requires authentication

**Response:** `200 OK`
```json
{
  "id": "payout_123",
  "amount": 25.00,
  "method": "paypal",
  "status": "completed",
  "requestedAt": "2026-06-07T22:00:00Z",
  "completedAt": "2026-06-08T10:00:00Z",
  "transactionId": "PAYPAL_TX_123",
  "details": {
    "email": "user@paypal.com"
  }
}
```

---

## Admin Endpoints

All admin endpoints require admin role verification.

### GET /api/admin/stats

Get platform statistics.

**Headers:** Requires admin authentication

**Response:** `200 OK`
```json
{
  "stats": {
    "totalUsers": 1000,
    "activeUsers": 250,
    "totalRevenue": 50000.00,
    "totalPayouts": 35000.00,
    "activeOffers": 50,
    "pendingPayouts": 15,
    "fraudAlerts": 3,
    "conversionRate": 0.75
  },
  "recentTransactions": [...]
}
```

---

### GET /api/admin/users

Get all users.

**Headers:** Requires admin authentication

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "balance": 25.50,
      "totalEarned": 125.00,
      "status": "active",
      "fraudFlags": 0,
      "tapScore": 85,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### PATCH /api/admin/users

Update user status.

**Headers:** Requires admin authentication

**Request Body:**
```json
{
  "userId": "user_123",
  "status": "suspended" // active, suspended, banned
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### POST /api/admin/users

Adjust user balance.

**Headers:** Requires admin authentication

**Request Body:**
```json
{
  "userId": "user_123",
  "action": "adjust_balance",
  "amount": 10.00, // positive or negative
  "reason": "Compensation for technical issue"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "newBalance": 35.50
}
```

---

### GET /api/admin/transactions

Get all transactions.

**Headers:** Requires admin authentication

**Response:** `200 OK`
```json
{
  "transactions": [...]
}
```

---

### POST /api/admin/transactions

Approve, reject, or refund transaction.

**Headers:** Requires admin authentication

**Request Body:**
```json
{
  "transactionId": "tx_123",
  "action": "approve", // approve, reject, refund
  "reason": "Verified completion" // required for reject/refund
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### GET /api/admin/offers

Get all offers.

**Headers:** Requires admin authentication

**Response:** `200 OK`
```json
{
  "offers": [...]
}
```

---

### POST /api/admin/offers

Create new offer.

**Headers:** Requires admin authentication

**Request Body:**
```json
{
  "name": "New Offer",
  "description": "Complete this task",
  "reward": 5.00,
  "category": "games",
  "difficulty": "easy",
  "status": "active",
  "featured": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "offerId": "offer_456"
}
```

---

### PATCH /api/admin/offers

Update existing offer.

**Headers:** Requires admin authentication

**Request Body:**
```json
{
  "id": "offer_123",
  "name": "Updated Offer Name",
  "reward": 7.50,
  "status": "paused"
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### DELETE /api/admin/offers

Delete offer.

**Headers:** Requires admin authentication

**Request Body:**
```json
{
  "offerId": "offer_123"
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### GET /api/admin/fraud

Get fraud alerts.

**Headers:** Requires admin authentication

**Response:** `200 OK`
```json
{
  "alerts": [
    {
      "id": "alert_123",
      "userId": "user_123",
      "type": "vpn",
      "severity": "high",
      "description": "VPN detected",
      "status": "pending",
      "timestamp": "2026-06-07T22:00:00Z"
    }
  ],
  "stats": {
    "totalAlerts": 50,
    "pendingAlerts": 10,
    "criticalAlerts": 2
  }
}
```

---

### POST /api/admin/fraud

Review fraud alert.

**Headers:** Requires admin authentication

**Request Body:**
```json
{
  "alertId": "alert_123",
  "status": "resolved", // resolved, false_positive
  "notes": "Verified legitimate user",
  "action": "suspend" // optional: ban, suspend
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

---

## Rate Limits

### Default Limits

- **Authentication endpoints**: 5 requests per minute
- **User endpoints**: 60 requests per minute
- **Offer endpoints**: 30 requests per minute
- **Transaction endpoints**: 30 requests per minute
- **Payout endpoints**: 10 requests per hour
- **Admin endpoints**: 100 requests per minute

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1623456789
```

### Rate Limit Exceeded

**Response:** `429 Too Many Requests`
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## Error Codes

### Standard HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional information"
  }
}
```

### Common Error Codes

- `INVALID_EMAIL` - Email format invalid
- `WEAK_PASSWORD` - Password doesn't meet requirements
- `EMAIL_EXISTS` - Email already registered
- `INVALID_TOKEN` - Authentication token invalid
- `INSUFFICIENT_BALANCE` - Not enough balance for operation
- `MINIMUM_NOT_MET` - Minimum payout threshold not met
- `OFFER_NOT_AVAILABLE` - Offer no longer available
- `ALREADY_COMPLETED` - Offer already completed
- `FRAUD_DETECTED` - Suspicious activity detected
- `ADMIN_REQUIRED` - Admin access required

---

## Webhooks

### Payout Completion

Webhook sent when payout is completed.

**URL**: Configured in admin panel

**Method**: POST

**Payload:**
```json
{
  "event": "payout.completed",
  "payoutId": "payout_123",
  "userId": "user_123",
  "amount": 25.00,
  "method": "paypal",
  "timestamp": "2026-06-08T10:00:00Z"
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { TapCashAPI } from '@tapcash/sdk';

const api = new TapCashAPI({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Get offers
const offers = await api.offers.list({
  category: 'games',
  difficulty: 'easy'
});

// Request payout
const payout = await api.payouts.request({
  amount: 25.00,
  method: 'paypal',
  details: { email: 'user@paypal.com' }
});
```

---

## Support

For API support:
- **Email**: api@tapcash.com
- **Documentation**: https://docs.tapcash.com
- **Status**: https://status.tapcash.com

---

**API Version**: 1.0.0  
**Last Updated**: 2026-06-07  
**Maintained By**: TapCash Engineering Team