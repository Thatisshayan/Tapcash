/**
 * Unit Tests for PayPal Integration
 * Tests successful transactions, failures, network errors, and edge cases
 */

import { createPayPalPayout, getPayoutStatus, getPayoutItemStatus, cancelPayoutItem } from '../paypal';

// Mock fetch globally
global.fetch = jest.fn();

describe('PayPal Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables
    process.env.PAYPAL_MODE = 'sandbox';
    process.env.PAYPAL_CLIENT_ID = 'test_client_id';
    process.env.PAYPAL_CLIENT_SECRET = 'test_client_secret';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createPayPalPayout', () => {
    it('should successfully create a payout', async () => {
      // Mock OAuth token response
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        // Mock payout creation response
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
        amount: 10.00,
        currency: 'USD',
        recipientEmail: 'test@example.com',
        note: 'Test payout',
        senderBatchId: 'TEST123',
      });

      expect(result.batch_header?.payout_batch_id).toBe('BATCH123');
      expect(result.batch_header?.batch_status).toBe('PENDING');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should validate email format', async () => {
      await expect(
        createPayPalPayout({
          amount: 10.00,
          currency: 'USD',
          recipientEmail: 'invalid-email',
          note: 'Test payout',
          senderBatchId: 'TEST123',
        })
      ).rejects.toThrow('Invalid recipient email');
    });

    it('should validate amount is positive', async () => {
      await expect(
        createPayPalPayout({
          amount: -10.00,
          currency: 'USD',
          recipientEmail: 'test@example.com',
          note: 'Test payout',
          senderBatchId: 'TEST123',
        })
      ).rejects.toThrow('Invalid payout amount');
    });

    it('should validate currency is supported', async () => {
      await expect(
        createPayPalPayout({
          amount: 10.00,
          currency: 'XYZ',
          recipientEmail: 'test@example.com',
          note: 'Test payout',
          senderBatchId: 'TEST123',
        })
      ).rejects.toThrow('Unsupported currency');
    });

    it('should handle authentication errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error_description: 'Invalid credentials' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error_description: 'Invalid credentials' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error_description: 'Invalid credentials' }),
        });

      await expect(
        createPayPalPayout({
          amount: 10.00,
          currency: 'USD',
          recipientEmail: 'test@example.com',
          note: 'Test payout',
          senderBatchId: 'TEST123',
        })
      ).rejects.toThrow('PayPal Auth Error');
    });

    it('should handle payout creation errors', async () => {
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
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            message: 'Insufficient funds',
            details: [{ issue: 'INSUFFICIENT_FUNDS', description: 'Not enough balance' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            message: 'Insufficient funds',
            details: [{ issue: 'INSUFFICIENT_FUNDS', description: 'Not enough balance' }],
          }),
        });

      await expect(
        createPayPalPayout({
          amount: 10.00,
          currency: 'USD',
          recipientEmail: 'test@example.com',
          note: 'Test payout',
          senderBatchId: 'TEST123',
        })
      ).rejects.toThrow('INSUFFICIENT_FUNDS');
    });

    it('should retry on network errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
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
        amount: 10.00,
        currency: 'USD',
        recipientEmail: 'test@example.com',
        note: 'Test payout',
        senderBatchId: 'TEST123',
      });

      expect(result.batch_header?.payout_batch_id).toBe('BATCH123');
      expect(global.fetch).toHaveBeenCalledTimes(4); // 1 auth + 3 payout attempts
    });

    it('should fail after max retries', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockRejectedValue(new Error('Network error'));

      await expect(
        createPayPalPayout({
          amount: 10.00,
          currency: 'USD',
          recipientEmail: 'test@example.com',
          note: 'Test payout',
          senderBatchId: 'TEST123',
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('getPayoutStatus', () => {
    it('should successfully get payout status', async () => {
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
              batch_status: 'SUCCESS',
            },
          }),
        });

      const result = await getPayoutStatus('BATCH123');

      expect(result.batch_header?.batch_status).toBe('SUCCESS');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should validate batch ID is provided', async () => {
      await expect(getPayoutStatus('')).rejects.toThrow('Payout batch ID is required');
    });

    it('should handle not found errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Batch not found' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Batch not found' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Batch not found' }),
        });

      await expect(getPayoutStatus('INVALID123')).rejects.toThrow('Batch not found');
    });
  });

  describe('getPayoutItemStatus', () => {
    it('should successfully get payout item status', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            payout_item_id: 'ITEM123',
            transaction_status: 'SUCCESS',
            payout_batch_id: 'BATCH123',
          }),
        });

      const result = await getPayoutItemStatus('ITEM123');

      expect(result.payout_item_id).toBe('ITEM123');
      expect(result.transaction_status).toBe('SUCCESS');
    });

    it('should validate item ID is provided', async () => {
      await expect(getPayoutItemStatus('')).rejects.toThrow('Payout item ID is required');
    });
  });

  describe('cancelPayoutItem', () => {
    it('should successfully cancel a payout item', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            payout_item_id: 'ITEM123',
            transaction_status: 'RETURNED',
            payout_batch_id: 'BATCH123',
          }),
        });

      const result = await cancelPayoutItem('ITEM123');

      expect(result.transaction_status).toBe('RETURNED');
    });

    it('should validate item ID is provided', async () => {
      await expect(cancelPayoutItem('')).rejects.toThrow('Payout item ID is required');
    });

    it('should handle already claimed items', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Item already claimed' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Item already claimed' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Item already claimed' }),
        });

      await expect(cancelPayoutItem('ITEM123')).rejects.toThrow('Item already claimed');
    });
  });

  describe('Missing credentials', () => {
    it('should throw error when credentials are missing', async () => {
      delete process.env.PAYPAL_CLIENT_ID;
      delete process.env.PAYPAL_CLIENT_SECRET;

      await expect(
        createPayPalPayout({
          amount: 10.00,
          currency: 'USD',
          recipientEmail: 'test@example.com',
          note: 'Test payout',
          senderBatchId: 'TEST123',
        })
      ).rejects.toThrow('Missing PayPal credentials');
    });
  });

  describe('Edge cases', () => {
    it('should handle very small amounts', async () => {
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
        amount: 0.01,
        currency: 'USD',
        recipientEmail: 'test@example.com',
        note: 'Test payout',
        senderBatchId: 'TEST123',
      });

      expect(result.batch_header?.payout_batch_id).toBe('BATCH123');
    });

    it('should handle large amounts', async () => {
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
        amount: 9999.99,
        currency: 'USD',
        recipientEmail: 'test@example.com',
        note: 'Test payout',
        senderBatchId: 'TEST123',
      });

      expect(result.batch_header?.payout_batch_id).toBe('BATCH123');
    });

    it('should handle special characters in email', async () => {
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
        amount: 10.00,
        currency: 'USD',
        recipientEmail: 'test+special@example.com',
        note: 'Test payout',
        senderBatchId: 'TEST123',
      });

      expect(result.batch_header?.payout_batch_id).toBe('BATCH123');
    });
  });
});

// Made with Bob
