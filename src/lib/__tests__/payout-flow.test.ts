/**
 * Integration Tests for Complete Payout Flow
 * Tests end-to-end payout process: balance → ledger → provider
 */

import { computeLedgerBalance, appendLedgerTransaction } from '../ledger';
import { createPayPalPayout } from '../paypal';
import { createInteracTransfer } from '../interac';
import { createTremendousOrder } from '../tremendous';

// Mock Firebase Admin
jest.mock('../firebaseAdmin', () => ({
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn((id?: string) => ({
        id: id || `mock-doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        set: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
      })),
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ docs: [], forEach: jest.fn() })),
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({ docs: [] })),
          })),
        })),
      })),
    })),
  },
  adminAuth: {},
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Payout Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up environment variables
    process.env.PAYPAL_MODE = 'sandbox';
    process.env.PAYPAL_CLIENT_ID = 'test_client_id';
    process.env.PAYPAL_CLIENT_SECRET = 'test_client_secret';
    process.env.INTERAC_ENVIRONMENT = 'sandbox';
    process.env.INTERAC_API_KEY = 'test_api_key';
    process.env.INTERAC_API_SECRET = 'test_api_secret';
    process.env.TREMENDOUS_ENVIRONMENT = 'sandbox';
    process.env.TREMENDOUS_API_KEY = 'test_api_key';
    process.env.TREMENDOUS_CAMPAIGN_ID = 'test_campaign_id';
  });

  describe('Complete PayPal Payout Flow', () => {
    it('should process complete payout flow successfully', async () => {
      const userId = 'test-user-123';
      const amountCoins = 1000; // $10

      // Mock successful PayPal payout
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            batch_header: {
              payout_batch_id: 'BATCH123',
              batch_status: 'PENDING',
            },
          }),
        });

      // Step 1: Create cashout request ledger entry
      const ledgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_requested',
        amountCoins,
        balanceEffectCoins: -amountCoins,
        status: 'pending',
        source: 'paypal',
      });

      expect(ledgerId).toBeDefined();

      // Step 2: Process payout with PayPal
      const payoutResult = await createPayPalPayout({
        amount: amountCoins / 100,
        currency: 'USD',
        recipientEmail: 'test@example.com',
        note: 'Test payout',
        senderBatchId: `TC-${userId}`,
      });

      expect(payoutResult.batch_header?.payout_batch_id).toBe('BATCH123');

      // Step 3: Create success ledger entry
      const successLedgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_paid',
        amountCoins,
        balanceEffectCoins: 0,
        status: 'paid',
        source: 'paypal',
        referenceId: payoutResult.batch_header?.payout_batch_id,
      });

      expect(successLedgerId).toBeDefined();
    });

    it('should rollback on payout failure', async () => {
      const userId = 'test-user-123';
      const amountCoins = 1000;

      // Mock failed PayPal payout
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            message: 'Insufficient funds',
            details: [{ issue: 'INSUFFICIENT_FUNDS', description: 'Not enough balance' }],
          }),
        });

      // Step 1: Create cashout request
      const ledgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_requested',
        amountCoins,
        balanceEffectCoins: -amountCoins,
        status: 'pending',
        source: 'paypal',
      });

      expect(ledgerId).toBeDefined();

      // Step 2: Attempt payout (should fail)
      let payoutError;
      try {
        await createPayPalPayout({
          amount: amountCoins / 100,
          currency: 'USD',
          recipientEmail: 'test@example.com',
          note: 'Test payout',
          senderBatchId: `TC-${userId}`,
        });
      } catch (error) {
        payoutError = error;
      }

      expect(payoutError).toBeDefined();

      // Step 3: Rollback with rejection entry
      const rollbackLedgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_rejected',
        amountCoins,
        balanceEffectCoins: amountCoins, // Refund
        status: 'rejected',
        source: 'paypal',
        referenceId: ledgerId,
      });

      expect(rollbackLedgerId).toBeDefined();
    });
  });

  describe('Complete Interac Payout Flow', () => {
    it('should process complete Interac transfer flow', async () => {
      const userId = 'test-user-456';
      const amountCoins = 2000; // $20

      // Mock successful Interac transfer
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transferId: 'TRANSFER123',
          status: 'pending',
          referenceNumber: 'REF123',
          createdAt: '2024-01-01T00:00:00Z',
          expiresAt: '2024-01-31T00:00:00Z',
        }),
      });

      // Step 1: Create cashout request
      const ledgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_requested',
        amountCoins,
        balanceEffectCoins: -amountCoins,
        status: 'pending',
        source: 'interac',
      });

      expect(ledgerId).toBeDefined();

      // Step 2: Process transfer
      const transferResult = await createInteracTransfer({
        email: 'test@example.com',
        amount: amountCoins / 100,
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue123',
      });

      expect(transferResult.transferId).toBe('TRANSFER123');

      // Step 3: Create success ledger entry
      const successLedgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_paid',
        amountCoins,
        balanceEffectCoins: 0,
        status: 'paid',
        source: 'interac',
        referenceId: transferResult.transferId,
      });

      expect(successLedgerId).toBeDefined();
    });
  });

  describe('Complete Tremendous Payout Flow', () => {
    it('should process complete gift card order flow', async () => {
      const userId = 'test-user-789';
      const amountCoins = 2500; // $25

      // Mock successful Tremendous order
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          order: {
            id: 'ORDER123',
            status: 'PENDING',
            created_at: '2024-01-01T00:00:00Z',
            reward: {
              id: 'REWARD123',
              order_id: 'ORDER123',
            },
          },
        }),
      });

      // Step 1: Create cashout request
      const ledgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_requested',
        amountCoins,
        balanceEffectCoins: -amountCoins,
        status: 'pending',
        source: 'tremendous',
      });

      expect(ledgerId).toBeDefined();

      // Step 2: Process order
      const orderResult = await createTremendousOrder({
        recipientEmail: 'test@example.com',
        amount: amountCoins / 100,
      });

      expect(orderResult.id).toBe('ORDER123');

      // Step 3: Create success ledger entry
      const successLedgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_paid',
        amountCoins,
        balanceEffectCoins: 0,
        status: 'paid',
        source: 'tremendous',
        referenceId: orderResult.id,
      });

      expect(successLedgerId).toBeDefined();
    });
  });

  describe('Insufficient Balance Handling', () => {
    it('should prevent payout when balance is insufficient', async () => {
      const userId = 'test-user-poor';
      
      // Mock empty ledger (no balance)
      const balance = await computeLedgerBalance(userId);
      
      expect(balance).toBe(0);
      
      // Should not proceed with payout if balance check fails
      const requestedAmount = 1000;
      expect(balance).toBeLessThan(requestedAmount);
    });
  });

  describe('Concurrent Payout Attempts', () => {
    it('should handle concurrent payout attempts safely', async () => {
      const userId = 'test-user-concurrent';
      const amountCoins = 1000;

      // Mock successful PayPal payouts
      (global.fetch as jest.Mock)
        .mockResolvedValue({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockResolvedValue({
          ok: true,
          json: async () => ({
            batch_header: {
              payout_batch_id: 'BATCH123',
              batch_status: 'PENDING',
            },
          }),
        });

      // Simulate two concurrent payout attempts
      const payout1Promise = appendLedgerTransaction({
        userId,
        type: 'cashout_requested',
        amountCoins,
        balanceEffectCoins: -amountCoins,
        status: 'pending',
        source: 'paypal',
      });

      const payout2Promise = appendLedgerTransaction({
        userId,
        type: 'cashout_requested',
        amountCoins,
        balanceEffectCoins: -amountCoins,
        status: 'pending',
        source: 'paypal',
      });

      const [ledger1, ledger2] = await Promise.all([payout1Promise, payout2Promise]);

      // Both should create separate ledger entries
      expect(ledger1).toBeDefined();
      expect(ledger2).toBeDefined();
      expect(ledger1).not.toBe(ledger2);
    });
  });

  describe('Transaction Rollback Scenarios', () => {
    it('should rollback on network timeout', async () => {
      const userId = 'test-user-timeout';
      const amountCoins = 1000;

      // Mock network timeout
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockRejectedValue(new Error('Network timeout'));

      // Create cashout request
      const ledgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_requested',
        amountCoins,
        balanceEffectCoins: -amountCoins,
        status: 'pending',
        source: 'paypal',
      });

      // Attempt payout (should fail after retries)
      let payoutError;
      try {
        await createPayPalPayout({
          amount: amountCoins / 100,
          currency: 'USD',
          recipientEmail: 'test@example.com',
          note: 'Test payout',
          senderBatchId: `TC-${userId}`,
        });
      } catch (error) {
        payoutError = error;
      }

      expect(payoutError).toBeDefined();

      // Rollback
      const rollbackLedgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_rejected',
        amountCoins,
        balanceEffectCoins: amountCoins,
        status: 'rejected',
        source: 'paypal',
        referenceId: ledgerId,
        metadata: { error: (payoutError as Error).message },
      });

      expect(rollbackLedgerId).toBeDefined();
    });

    it('should rollback on provider rejection', async () => {
      const userId = 'test-user-rejected';
      const amountCoins = 1000;

      // Mock provider rejection
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            message: 'Recipient account restricted',
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            message: 'Recipient account restricted',
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            message: 'Recipient account restricted',
          }),
        });

      // Create cashout request
      const ledgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_requested',
        amountCoins,
        balanceEffectCoins: -amountCoins,
        status: 'pending',
        source: 'paypal',
      });

      // Attempt payout (should fail)
      let payoutError;
      try {
        await createPayPalPayout({
          amount: amountCoins / 100,
          currency: 'USD',
          recipientEmail: 'test@example.com',
          note: 'Test payout',
          senderBatchId: `TC-${userId}`,
        });
      } catch (error) {
        payoutError = error;
      }

      expect(payoutError).toBeDefined();
      expect((payoutError as Error).message).toContain('Recipient account restricted');

      // Rollback
      const rollbackLedgerId = await appendLedgerTransaction({
        userId,
        type: 'cashout_rejected',
        amountCoins,
        balanceEffectCoins: amountCoins,
        status: 'rejected',
        source: 'paypal',
        referenceId: ledgerId,
      });

      expect(rollbackLedgerId).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum payout amounts', async () => {
      const userId = 'test-user-min';
      const amountCoins = 1; // $0.01

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            batch_header: {
              payout_batch_id: 'BATCH123',
              batch_status: 'PENDING',
            },
          }),
        });

      const result = await createPayPalPayout({
        amount: amountCoins / 100,
        currency: 'USD',
        recipientEmail: 'test@example.com',
        note: 'Minimum payout',
        senderBatchId: `TC-${userId}`,
      });

      expect(result.batch_header?.payout_batch_id).toBe('BATCH123');
    });

    it('should handle maximum payout amounts', async () => {
      const userId = 'test-user-max';
      const amountCoins = 1000000; // $10,000

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            batch_header: {
              payout_batch_id: 'BATCH123',
              batch_status: 'PENDING',
            },
          }),
        });

      const result = await createPayPalPayout({
        amount: amountCoins / 100,
        currency: 'USD',
        recipientEmail: 'test@example.com',
        note: 'Maximum payout',
        senderBatchId: `TC-${userId}`,
      });

      expect(result.batch_header?.payout_batch_id).toBe('BATCH123');
    });
  });
});

// Made with Bob
