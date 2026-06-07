/**
 * Unit Tests for Interac Integration
 * Tests successful transfers, validation, failures, and edge cases
 */

import {
  createInteracTransfer,
  getInteracTransferStatus,
  cancelInteracTransfer,
  validateInteracAnswer,
  validateSecurityQuestion,
  prepareManualInteracPayout,
} from '../interac';

// Mock fetch globally
global.fetch = jest.fn();

describe('Interac Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables
    process.env.INTERAC_ENVIRONMENT = 'sandbox';
    process.env.INTERAC_API_KEY = 'test_api_key';
    process.env.INTERAC_API_SECRET = 'test_api_secret';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validateInteracAnswer', () => {
    it('should accept valid answers', () => {
      expect(validateInteracAnswer('answer123').valid).toBe(true);
      expect(validateInteracAnswer('ANSWER123').valid).toBe(true);
      expect(validateInteracAnswer('abc123xyz').valid).toBe(true);
    });

    it('should reject answers that are too short', () => {
      const result = validateInteracAnswer('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 6 characters');
    });

    it('should reject answers that are too long', () => {
      const result = validateInteracAnswer('a'.repeat(26));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not exceed 25 characters');
    });

    it('should reject answers with spaces', () => {
      const result = validateInteracAnswer('answer 123');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot contain spaces');
    });

    it('should reject answers with special characters', () => {
      const result = validateInteracAnswer('answer@123');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('alphanumeric only');
    });
  });

  describe('validateSecurityQuestion', () => {
    it('should accept valid questions', () => {
      expect(validateSecurityQuestion('What is your favorite color?').valid).toBe(true);
      expect(validateSecurityQuestion('What city were you born in?').valid).toBe(true);
    });

    it('should reject questions that are too short', () => {
      const result = validateSecurityQuestion('Color?');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 10 characters');
    });

    it('should reject questions that are too long', () => {
      const result = validateSecurityQuestion('a'.repeat(101));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not exceed 100 characters');
    });
  });

  describe('createInteracTransfer', () => {
    it('should successfully create a transfer', async () => {
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

      const result = await createInteracTransfer({
        email: 'test@example.com',
        amount: 100.00,
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue123',
      });

      expect(result.transferId).toBe('TRANSFER123');
      expect(result.status).toBe('pending');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should validate email format', async () => {
      await expect(
        createInteracTransfer({
          email: 'invalid-email',
          amount: 100.00,
          securityQuestion: 'What is your favorite color?',
          securityAnswer: 'blue123',
        })
      ).rejects.toThrow('Invalid recipient email');
    });

    it('should validate amount is positive', async () => {
      await expect(
        createInteracTransfer({
          email: 'test@example.com',
          amount: -100.00,
          securityQuestion: 'What is your favorite color?',
          securityAnswer: 'blue123',
        })
      ).rejects.toThrow('Invalid transfer amount');
    });

    it('should enforce Interac transfer limit', async () => {
      await expect(
        createInteracTransfer({
          email: 'test@example.com',
          amount: 3500.00,
          securityQuestion: 'What is your favorite color?',
          securityAnswer: 'blue123',
        })
      ).rejects.toThrow('Interac e-Transfer limit is $3,000 CAD');
    });

    it('should validate security answer', async () => {
      await expect(
        createInteracTransfer({
          email: 'test@example.com',
          amount: 100.00,
          securityQuestion: 'What is your favorite color?',
          securityAnswer: 'abc',
        })
      ).rejects.toThrow('at least 6 characters');
    });

    it('should validate security question', async () => {
      await expect(
        createInteracTransfer({
          email: 'test@example.com',
          amount: 100.00,
          securityQuestion: 'Color?',
          securityAnswer: 'blue123',
        })
      ).rejects.toThrow('at least 10 characters');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Recipient email not registered' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Recipient email not registered' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Recipient email not registered' }),
        });

      await expect(
        createInteracTransfer({
          email: 'test@example.com',
          amount: 100.00,
          securityQuestion: 'What is your favorite color?',
          securityAnswer: 'blue123',
        })
      ).rejects.toThrow('Recipient email not registered');
    });

    it('should retry on network errors', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            transferId: 'TRANSFER123',
            status: 'pending',
            referenceNumber: 'REF123',
            createdAt: '2024-01-01T00:00:00Z',
            expiresAt: '2024-01-31T00:00:00Z',
          }),
        });

      const result = await createInteracTransfer({
        email: 'test@example.com',
        amount: 100.00,
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue123',
      });

      expect(result.transferId).toBe('TRANSFER123');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should fallback to manual processing when API not configured', async () => {
      delete process.env.INTERAC_API_KEY;
      delete process.env.INTERAC_API_SECRET;

      const result = await createInteracTransfer({
        email: 'test@example.com',
        amount: 100.00,
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue123',
      });

      expect(result.status).toBe('pending');
      expect(result.transferId).toContain('TC-MANUAL-');
    });
  });

  describe('getInteracTransferStatus', () => {
    it('should successfully get transfer status', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transferId: 'TRANSFER123',
          status: 'deposited',
          referenceNumber: 'REF123',
          createdAt: '2024-01-01T00:00:00Z',
          expiresAt: '2024-01-31T00:00:00Z',
        }),
      });

      const result = await getInteracTransferStatus('TRANSFER123');

      expect(result.status).toBe('deposited');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should validate transfer ID is provided', async () => {
      await expect(getInteracTransferStatus('')).rejects.toThrow('Transfer ID is required');
    });

    it('should handle not found errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Transfer not found' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Transfer not found' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Transfer not found' }),
        });

      await expect(getInteracTransferStatus('INVALID123')).rejects.toThrow('Transfer not found');
    });

    it('should require API credentials', async () => {
      delete process.env.INTERAC_API_KEY;

      await expect(getInteracTransferStatus('TRANSFER123')).rejects.toThrow(
        'Interac API credentials not configured'
      );
    });
  });

  describe('cancelInteracTransfer', () => {
    it('should successfully cancel a transfer', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transferId: 'TRANSFER123',
          status: 'cancelled',
          referenceNumber: 'REF123',
          createdAt: '2024-01-01T00:00:00Z',
          expiresAt: '2024-01-31T00:00:00Z',
        }),
      });

      const result = await cancelInteracTransfer('TRANSFER123');

      expect(result.status).toBe('cancelled');
    });

    it('should validate transfer ID is provided', async () => {
      await expect(cancelInteracTransfer('')).rejects.toThrow('Transfer ID is required');
    });

    it('should handle already deposited transfers', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Transfer already deposited' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Transfer already deposited' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Transfer already deposited' }),
        });

      await expect(cancelInteracTransfer('TRANSFER123')).rejects.toThrow('Transfer already deposited');
    });
  });

  describe('prepareManualInteracPayout', () => {
    it('should create manual payout record', async () => {
      const result = await prepareManualInteracPayout({
        email: 'test@example.com',
        amount: 100.00,
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue123',
      });

      expect(result.status).toBe('pending');
      expect(result.transferId).toContain('TC-MANUAL-');
      expect(result.referenceNumber).toContain('TC-MANUAL-');
    });

    it('should set expiry to 30 days', async () => {
      const result = await prepareManualInteracPayout({
        email: 'test@example.com',
        amount: 100.00,
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue123',
      });

      const createdAt = new Date(result.createdAt);
      const expiresAt = new Date(result.expiresAt);
      const daysDiff = (expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeCloseTo(30, 0);
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum transfer amount', async () => {
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

      const result = await createInteracTransfer({
        email: 'test@example.com',
        amount: 0.01,
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue123',
      });

      expect(result.transferId).toBe('TRANSFER123');
    });

    it('should handle maximum transfer amount', async () => {
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

      const result = await createInteracTransfer({
        email: 'test@example.com',
        amount: 3000.00,
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue123',
      });

      expect(result.transferId).toBe('TRANSFER123');
    });

    it('should handle special characters in email', async () => {
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

      const result = await createInteracTransfer({
        email: 'test+special@example.com',
        amount: 100.00,
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue123',
      });

      expect(result.transferId).toBe('TRANSFER123');
    });

    it('should handle recipient name', async () => {
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

      const result = await createInteracTransfer({
        email: 'test@example.com',
        recipientName: 'John Doe',
        amount: 100.00,
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue123',
      });

      expect(result.transferId).toBe('TRANSFER123');
    });
  });
});

// Made with Bob
