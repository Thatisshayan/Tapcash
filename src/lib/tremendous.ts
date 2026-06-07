/**
 * Tremendous Gift Card API Utility for TapCash
 * Enhanced with catalog fetching, delivery tracking, and error handling
 */

const TREMENDOUS_ENV = process.env.TREMENDOUS_ENVIRONMENT || 'sandbox';
const BASE_URL = TREMENDOUS_ENV === 'production'
  ? 'https://api.tremendous.com/api/v2'
  : 'https://testflight.tremendous.com/api/v2';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

export interface TremendousOrderOptions {
  recipientEmail: string;
  recipientName?: string;
  amount: number;
  currency?: string;
  productId?: string;
  externalId?: string;
}

export interface TremendousOrder {
  id: string;
  status: string;
  created_at: string;
  reward?: {
    id: string;
    order_id: string;
    value: {
      denomination: number;
      currency_code: string;
    };
    recipient: {
      name: string;
      email: string;
    };
    delivery: {
      method: string;
      status: string;
    };
    redemption_url?: string;
  };
}

export interface TremendousProduct {
  id: string;
  name: string;
  description: string;
  currency_codes: string[];
  countries: string[];
  min_price_in_cents: number;
  max_price_in_cents: number;
  images: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface TremendousCatalog {
  products: TremendousProduct[];
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for API calls
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  delayMs: number = RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`[Tremendous] Attempt ${attempt}/${maxAttempts} failed:`, error);
      
      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt);
      }
    }
  }
  
  throw lastError || new Error("Operation failed after retries");
}

/**
 * Log transaction for audit trail
 */
function logTransaction(action: string, data: unknown, error?: Error) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    environment: TREMENDOUS_ENV,
    data,
    error: error ? { message: error.message, stack: error.stack } : undefined,
  };
  
  console.log(`[Tremendous Transaction Log]`, JSON.stringify(logEntry, null, 2));
}

/**
 * Get API credentials
 */
function getCredentials() {
  const apiKey = process.env.TREMENDOUS_API_KEY;
  const campaignId = process.env.TREMENDOUS_CAMPAIGN_ID;

  if (!apiKey) {
    throw new Error('TREMENDOUS_API_KEY is missing from environment variables');
  }

  return { apiKey, campaignId };
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Fetch available gift card catalog
 */
export async function getTremendousCatalog(currency: string = 'USD'): Promise<TremendousCatalog> {
  const { apiKey } = getCredentials();

  logTransaction('get_catalog_request', { currency });

  try {
    const result = await retryOperation(async () => {
      const response = await fetch(`${BASE_URL}/products?currency_code=${currency}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || 'Failed to fetch catalog');
      }

      return await response.json();
    });

    logTransaction('get_catalog_success', {
      currency,
      productCount: result.products?.length || 0,
    });

    return result;
  } catch (error) {
    logTransaction('get_catalog_error', { currency }, error as Error);
    throw error;
  }
}

/**
 * Get details of a specific product
 */
export async function getTremendousProduct(productId: string): Promise<TremendousProduct> {
  const { apiKey } = getCredentials();

  if (!productId) {
    throw new Error('Product ID is required');
  }

  logTransaction('get_product_request', { productId });

  try {
    const result = await retryOperation(async () => {
      const response = await fetch(`${BASE_URL}/products/${productId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || 'Failed to fetch product');
      }

      const data = await response.json();
      return data.product;
    });

    logTransaction('get_product_success', { productId, name: result.name });

    return result;
  } catch (error) {
    logTransaction('get_product_error', { productId }, error as Error);
    throw error;
  }
}

/**
 * Create a Tremendous gift card order with enhanced error handling
 */
export async function createTremendousOrder({
  recipientEmail,
  recipientName = "TapCash User",
  amount,
  currency = "USD",
  productId,
  externalId,
}: TremendousOrderOptions): Promise<TremendousOrder> {
  // Validation
  if (!isValidEmail(recipientEmail)) {
    throw new Error(`Invalid recipient email: ${recipientEmail}`);
  }

  if (amount <= 0) {
    throw new Error(`Invalid order amount: ${amount}`);
  }

  if (!['USD', 'CAD'].includes(currency)) {
    throw new Error(`Unsupported currency: ${currency}. Tremendous supports USD and CAD.`);
  }

  const { apiKey, campaignId } = getCredentials();

  const orderId = externalId || `TC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  logTransaction('create_order_request', {
    recipientEmail,
    amount,
    currency,
    productId,
    externalId: orderId,
  });

  try {
    const payload: Record<string, unknown> = {
      external_id: orderId,
      payment: {
        funding_source_id: "BALANCE"
      },
      reward: {
        delivery: {
          method: "EMAIL"
        },
        recipient: {
          name: recipientName,
          email: recipientEmail
        },
        value: {
          denomination: amount,
          currency_code: currency
        }
      }
    };

    // Add campaign_id if available
    if (campaignId) {
      (payload.reward as Record<string, unknown>).campaign_id = campaignId;
    }

    // Add specific product if requested
    if (productId) {
      (payload.reward as Record<string, unknown>).products = [productId];
    }

    const result = await retryOperation(async () => {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.errors?.[0]?.message || 'Failed to create Tremendous order';
        throw new Error(errorMessage);
      }

      return responseData.order;
    });

    logTransaction('create_order_success', {
      orderId: result.id,
      status: result.status,
      rewardId: result.reward?.id,
    });

    return result;
  } catch (error) {
    logTransaction('create_order_error', { externalId: orderId }, error as Error);
    throw error;
  }
}

/**
 * Get the status of a Tremendous order
 */
export async function getTremendousOrderStatus(orderId: string): Promise<TremendousOrder> {
  const { apiKey } = getCredentials();

  if (!orderId) {
    throw new Error('Order ID is required');
  }

  logTransaction('get_order_status_request', { orderId });

  try {
    const result = await retryOperation(async () => {
      const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || 'Failed to fetch order status');
      }

      const data = await response.json();
      return data.order;
    });

    logTransaction('get_order_status_success', {
      orderId,
      status: result.status,
      deliveryStatus: result.reward?.delivery?.status,
    });

    return result;
  } catch (error) {
    logTransaction('get_order_status_error', { orderId }, error as Error);
    throw error;
  }
}

/**
 * Get reward details (includes redemption URL)
 */
export async function getTremendousReward(rewardId: string) {
  const { apiKey } = getCredentials();

  if (!rewardId) {
    throw new Error('Reward ID is required');
  }

  logTransaction('get_reward_request', { rewardId });

  try {
    const result = await retryOperation(async () => {
      const response = await fetch(`${BASE_URL}/rewards/${rewardId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || 'Failed to fetch reward');
      }

      const data = await response.json();
      return data.reward;
    });

    logTransaction('get_reward_success', {
      rewardId,
      deliveryStatus: result.delivery?.status,
    });

    return result;
  } catch (error) {
    logTransaction('get_reward_error', { rewardId }, error as Error);
    throw error;
  }
}

/**
 * Cancel a Tremendous order (if not yet delivered)
 */
export async function cancelTremendousOrder(orderId: string): Promise<TremendousOrder> {
  const { apiKey } = getCredentials();

  if (!orderId) {
    throw new Error('Order ID is required');
  }

  logTransaction('cancel_order_request', { orderId });

  try {
    const result = await retryOperation(async () => {
      const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || 'Failed to cancel order');
      }

      const data = await response.json();
      return data.order;
    });

    logTransaction('cancel_order_success', {
      orderId,
      status: result.status,
    });

    return result;
  } catch (error) {
    logTransaction('cancel_order_error', { orderId }, error as Error);
    throw error;
  }
}
