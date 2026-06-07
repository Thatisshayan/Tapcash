/**
 * Unit Tests for Tremendous Integration
 * Tests gift card orders, catalog fetching, delivery tracking, and edge cases
 */

import {
  createTremendousOrder,
  getTremendousCatalog,
  getTremendousProduct,
  getTremendousOrderStatus,
  getTremendousReward,
  cancelTremendousOrder,
} from '../tremendous';

// Mock fetch globally
global.fetch = jest.fn();

describe('Tremendous Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables
    process.env.TREMENDOUS_ENVIRONMENT = 'sandbox';
    process.env.TREMENDOUS_API_KEY = 'test_api_key';
    process.env.TREMENDOUS_CAMPAIGN_ID = 'test_campaign_id';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTremendousCatalog', () => {
    it('should successfully fetch catalog', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: [
            {
              id: 'PROD1',
              name: 'Amazon Gift Card',
              description: 'Amazon.com gift card',
              currency_codes: ['USD', 'CAD'],
              countries: ['US', 'CA'],
              min_price_in_cents: 500,
              max_price_in_cents: 50000,
              images: {
                small: 'https://example.com/small.jpg',
                medium: 'https://example.com/medium.jpg',
                large: 'https://example.com/large.jpg',
              },
            },
          ],
        }),
      });

      const result = await getTremendousCatalog('USD');

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Amazon Gift Card');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Invalid currency code' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Invalid currency code' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Invalid currency code' }],
          }),
        });

      await expect(getTremendousCatalog('XYZ')).rejects.toThrow('Invalid currency code');
    });

    it('should retry on network errors', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ products: [] }),
        });

      const result = await getTremendousCatalog('USD');

      expect(result.products).toHaveLength(0);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('getTremendousProduct', () => {
    it('should successfully fetch product details', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          product: {
            id: 'PROD1',
            name: 'Amazon Gift Card',
            description: 'Amazon.com gift card',
            currency_codes: ['USD', 'CAD'],
            countries: ['US', 'CA'],
            min_price_in_cents: 500,
            max_price_in_cents: 50000,
            images: {
              small: 'https://example.com/small.jpg',
              medium: 'https://example.com/medium.jpg',
              large: 'https://example.com/large.jpg',
            },
          },
        }),
      });

      const result = await getTremendousProduct('PROD1');

      expect(result.name).toBe('Amazon Gift Card');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should validate product ID is provided', async () => {
      await expect(getTremendousProduct('')).rejects.toThrow('Product ID is required');
    });

    it('should handle not found errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Product not found' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Product not found' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Product not found' }],
          }),
        });

      await expect(getTremendousProduct('INVALID')).rejects.toThrow('Product not found');
    });
  });

  describe('createTremendousOrder', () => {
    it('should successfully create an order', async () => {
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
              value: {
                denomination: 25,
                currency_code: 'USD',
              },
              recipient: {
                name: 'Test User',
                email: 'test@example.com',
              },
              delivery: {
                method: 'EMAIL',
                status: 'SCHEDULED',
              },
            },
          },
        }),
      });

      const result = await createTremendousOrder({
        recipientEmail: 'test@example.com',
        recipientName: 'Test User',
        amount: 25,
        currency: 'USD',
      });

      expect(result.id).toBe('ORDER123');
      expect(result.status).toBe('PENDING');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should validate email format', async () => {
      await expect(
        createTremendousOrder({
          recipientEmail: 'invalid-email',
          amount: 25,
        })
      ).rejects.toThrow('Invalid recipient email');
    });

    it('should validate amount is positive', async () => {
      await expect(
        createTremendousOrder({
          recipientEmail: 'test@example.com',
          amount: -25,
        })
      ).rejects.toThrow('Invalid order amount');
    });

    it('should validate currency is supported', async () => {
      await expect(
        createTremendousOrder({
          recipientEmail: 'test@example.com',
          amount: 25,
          currency: 'EUR',
        })
      ).rejects.toThrow('Unsupported currency');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Insufficient balance' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Insufficient balance' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Insufficient balance' }],
          }),
        });

      await expect(
        createTremendousOrder({
          recipientEmail: 'test@example.com',
          amount: 25,
        })
      ).rejects.toThrow('Insufficient balance');
    });

    it('should retry on network errors', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            order: {
              id: 'ORDER123',
              status: 'PENDING',
              created_at: '2024-01-01T00:00:00Z',
            },
          }),
        });

      const result = await createTremendousOrder({
        recipientEmail: 'test@example.com',
        amount: 25,
      });

      expect(result.id).toBe('ORDER123');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should include product ID when specified', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          order: {
            id: 'ORDER123',
            status: 'PENDING',
            created_at: '2024-01-01T00:00:00Z',
          },
        }),
      });

      await createTremendousOrder({
        recipientEmail: 'test@example.com',
        amount: 25,
        productId: 'PROD1',
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.reward.products).toEqual(['PROD1']);
    });

    it('should include external ID when specified', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          order: {
            id: 'ORDER123',
            status: 'PENDING',
            created_at: '2024-01-01T00:00:00Z',
          },
        }),
      });

      await createTremendousOrder({
        recipientEmail: 'test@example.com',
        amount: 25,
        externalId: 'EXT123',
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.external_id).toBe('EXT123');
    });
  });

  describe('getTremendousOrderStatus', () => {
    it('should successfully get order status', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          order: {
            id: 'ORDER123',
            status: 'EXECUTED',
            created_at: '2024-01-01T00:00:00Z',
            reward: {
              delivery: {
                status: 'DELIVERED',
              },
            },
          },
        }),
      });

      const result = await getTremendousOrderStatus('ORDER123');

      expect(result.status).toBe('EXECUTED');
      expect(result.reward?.delivery?.status).toBe('DELIVERED');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should validate order ID is provided', async () => {
      await expect(getTremendousOrderStatus('')).rejects.toThrow('Order ID is required');
    });

    it('should handle not found errors', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Order not found' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Order not found' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Order not found' }],
          }),
        });

      await expect(getTremendousOrderStatus('INVALID')).rejects.toThrow('Order not found');
    });
  });

  describe('getTremendousReward', () => {
    it('should successfully get reward details', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          reward: {
            id: 'REWARD123',
            order_id: 'ORDER123',
            delivery: {
              status: 'DELIVERED',
            },
            redemption_url: 'https://example.com/redeem/123',
          },
        }),
      });

      const result = await getTremendousReward('REWARD123');

      expect(result.id).toBe('REWARD123');
      expect(result.redemption_url).toBe('https://example.com/redeem/123');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should validate reward ID is provided', async () => {
      await expect(getTremendousReward('')).rejects.toThrow('Reward ID is required');
    });
  });

  describe('cancelTremendousOrder', () => {
    it('should successfully cancel an order', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          order: {
            id: 'ORDER123',
            status: 'CANCELED',
            created_at: '2024-01-01T00:00:00Z',
          },
        }),
      });

      const result = await cancelTremendousOrder('ORDER123');

      expect(result.status).toBe('CANCELED');
    });

    it('should validate order ID is provided', async () => {
      await expect(cancelTremendousOrder('')).rejects.toThrow('Order ID is required');
    });

    it('should handle already delivered orders', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Order already delivered' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Order already delivered' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            errors: [{ message: 'Order already delivered' }],
          }),
        });

      await expect(cancelTremendousOrder('ORDER123')).rejects.toThrow('Order already delivered');
    });
  });

  describe('Missing credentials', () => {
    it('should throw error when API key is missing', async () => {
      delete process.env.TREMENDOUS_API_KEY;

      await expect(
        createTremendousOrder({
          recipientEmail: 'test@example.com',
          amount: 25,
        })
      ).rejects.toThrow('TREMENDOUS_API_KEY is missing');
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum order amount', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          order: {
            id: 'ORDER123',
            status: 'PENDING',
            created_at: '2024-01-01T00:00:00Z',
          },
        }),
      });

      const result = await createTremendousOrder({
        recipientEmail: 'test@example.com',
        amount: 0.01,
      });

      expect(result.id).toBe('ORDER123');
    });

    it('should handle large order amounts', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          order: {
            id: 'ORDER123',
            status: 'PENDING',
            created_at: '2024-01-01T00:00:00Z',
          },
        }),
      });

      const result = await createTremendousOrder({
        recipientEmail: 'test@example.com',
        amount: 5000,
      });

      expect(result.id).toBe('ORDER123');
    });

    it('should handle special characters in email', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          order: {
            id: 'ORDER123',
            status: 'PENDING',
            created_at: '2024-01-01T00:00:00Z',
          },
        }),
      });

      const result = await createTremendousOrder({
        recipientEmail: 'test+special@example.com',
        amount: 25,
      });

      expect(result.id).toBe('ORDER123');
    });

    it('should handle CAD currency', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          order: {
            id: 'ORDER123',
            status: 'PENDING',
            created_at: '2024-01-01T00:00:00Z',
          },
        }),
      });

      const result = await createTremendousOrder({
        recipientEmail: 'test@example.com',
        amount: 25,
        currency: 'CAD',
      });

      expect(result.id).toBe('ORDER123');
    });

    it('should use default recipient name when not provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          order: {
            id: 'ORDER123',
            status: 'PENDING',
            created_at: '2024-01-01T00:00:00Z',
          },
        }),
      });

      await createTremendousOrder({
        recipientEmail: 'test@example.com',
        amount: 25,
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      expect(body.reward.recipient.name).toBe('TapCash User');
    });
  });
});

// Made with Bob
