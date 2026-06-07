/**
 * PayPal REST API Utility for TapCash Payouts
 * Enhanced with error handling, retry logic, and transaction logging
 */

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

interface PayPalToken {
  access_token: string;
  expires_in: number;
}

type PayPalErrorResponse = {
  error_description?: string;
  message?: string;
  name?: string;
  details?: Array<{ issue: string; description: string }>;
};

interface PayPalApiResponse {
  message?: string;
  batch_header?: {
    payout_batch_id: string;
    batch_status: string;
  };
  [key: string]: unknown;
}

interface PayPalPayoutItem {
  payout_item_id: string;
  transaction_id?: string;
  transaction_status: string;
  payout_item_fee?: {
    currency: string;
    value: string;
  };
  payout_batch_id: string;
  errors?: {
    name: string;
    message: string;
  };
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
      console.warn(`[PayPal] Attempt ${attempt}/${maxAttempts} failed:`, error);
      
      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt); // Exponential backoff
      }
    }
  }
  
  throw lastError || new Error("Operation failed after retries");
}

/**
 * Get OAuth2 Access Token from PayPal with retry logic
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal credentials in environment variables.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  return retryOperation(async () => {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const error = (await response.json()) as PayPalErrorResponse;
      throw new Error(`PayPal Auth Error: ${error.error_description || response.statusText}`);
    }

    const data: PayPalToken = await response.json();
    return data.access_token;
  });
}

/**
 * Log transaction for audit trail
 */
function logTransaction(action: string, data: unknown, error?: Error) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    mode: process.env.PAYPAL_MODE || 'sandbox',
    data,
    error: error ? { message: error.message, stack: error.stack } : undefined,
  };
  
  console.log(`[PayPal Transaction Log]`, JSON.stringify(logEntry, null, 2));
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create a PayPal Payout request with enhanced error handling
 */
export async function createPayPalPayout(params: {
  amount: number;
  currency: string;
  recipientEmail: string;
  note: string;
  senderBatchId: string;
}) {
  // Validation
  if (!isValidEmail(params.recipientEmail)) {
    throw new Error(`Invalid recipient email: ${params.recipientEmail}`);
  }
  
  if (params.amount <= 0) {
    throw new Error(`Invalid payout amount: ${params.amount}`);
  }
  
  if (!['USD', 'CAD', 'EUR', 'GBP'].includes(params.currency)) {
    throw new Error(`Unsupported currency: ${params.currency}`);
  }

  logTransaction('create_payout_request', {
    senderBatchId: params.senderBatchId,
    amount: params.amount,
    currency: params.currency,
    recipientEmail: params.recipientEmail,
  });

  try {
    const accessToken = await getAccessToken();

    const body = {
      sender_batch_header: {
        sender_batch_id: params.senderBatchId,
        email_subject: "You have a payout from TapCash!",
        email_message: "Congratulations! You have received a reward payout from TapCash. Your funds are now available in your PayPal account.",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: params.amount.toFixed(2),
            currency: params.currency,
          },
          note: params.note,
          sender_item_id: `item_${params.senderBatchId}`,
          receiver: params.recipientEmail,
        },
      ],
    };

    const result = await retryOperation(async () => {
      const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as PayPalApiResponse;

      if (!response.ok) {
        const errorDetails = (data as PayPalErrorResponse).details || [];
        const errorMessage = errorDetails.length > 0
          ? errorDetails.map(d => `${d.issue}: ${d.description}`).join('; ')
          : data.message || "PayPal Payout Request Failed";
        
        throw new Error(errorMessage);
      }

      return data;
    });

    logTransaction('create_payout_success', {
      senderBatchId: params.senderBatchId,
      batchId: result.batch_header?.payout_batch_id,
      status: result.batch_header?.batch_status,
    });

    return result;
  } catch (error) {
    logTransaction('create_payout_error', { senderBatchId: params.senderBatchId }, error as Error);
    throw error;
  }
}

/**
 * Check the status of a PayPal Payout with retry logic
 */
export async function getPayoutStatus(payoutBatchId: string) {
  if (!payoutBatchId) {
    throw new Error("Payout batch ID is required");
  }

  logTransaction('get_payout_status_request', { payoutBatchId });

  try {
    const accessToken = await getAccessToken();

    const result = await retryOperation(async () => {
      const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts/${payoutBatchId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = (await response.json()) as PayPalErrorResponse;
        throw new Error(error.message || "Failed to fetch payout status");
      }

      return (await response.json()) as PayPalApiResponse;
    });

    logTransaction('get_payout_status_success', {
      payoutBatchId,
      status: result.batch_header?.batch_status,
    });

    return result;
  } catch (error) {
    logTransaction('get_payout_status_error', { payoutBatchId }, error as Error);
    throw error;
  }
}

/**
 * Get details of a specific payout item
 */
export async function getPayoutItemStatus(payoutItemId: string): Promise<PayPalPayoutItem> {
  if (!payoutItemId) {
    throw new Error("Payout item ID is required");
  }

  logTransaction('get_payout_item_request', { payoutItemId });

  try {
    const accessToken = await getAccessToken();

    const result = await retryOperation(async () => {
      const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts-item/${payoutItemId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = (await response.json()) as PayPalErrorResponse;
        throw new Error(error.message || "Failed to fetch payout item status");
      }

      return (await response.json()) as PayPalPayoutItem;
    });

    logTransaction('get_payout_item_success', {
      payoutItemId,
      status: result.transaction_status,
    });

    return result;
  } catch (error) {
    logTransaction('get_payout_item_error', { payoutItemId }, error as Error);
    throw error;
  }
}

/**
 * Cancel an unclaimed payout
 */
export async function cancelPayoutItem(payoutItemId: string): Promise<PayPalPayoutItem> {
  if (!payoutItemId) {
    throw new Error("Payout item ID is required");
  }

  logTransaction('cancel_payout_item_request', { payoutItemId });

  try {
    const accessToken = await getAccessToken();

    const result = await retryOperation(async () => {
      const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts-item/${payoutItemId}/cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = (await response.json()) as PayPalErrorResponse;
        throw new Error(error.message || "Failed to cancel payout item");
      }

      return (await response.json()) as PayPalPayoutItem;
    });

    logTransaction('cancel_payout_item_success', {
      payoutItemId,
      status: result.transaction_status,
    });

    return result;
  } catch (error) {
    logTransaction('cancel_payout_item_error', { payoutItemId }, error as Error);
    throw error;
  }
}
