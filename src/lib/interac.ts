/**
 * Interac e-Transfer Utility for TapCash
 * Enhanced with API integration, validation, and error handling
 */

const INTERAC_API_BASE = process.env.INTERAC_ENVIRONMENT === "production"
  ? "https://api.interac.ca/v1"
  : "https://sandbox.interac.ca/v1";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

export interface InteracPayoutDetails {
  email: string;
  securityQuestion: string;
  securityAnswer: string;
  amount: number;
  recipientName?: string;
  referenceNumber?: string;
}

export interface InteracTransferResponse {
  transferId: string;
  status: "pending" | "sent" | "deposited" | "cancelled" | "expired";
  referenceNumber: string;
  createdAt: string;
  expiresAt: string;
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
      console.warn(`[Interac] Attempt ${attempt}/${maxAttempts} failed:`, error);
      
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
    environment: process.env.INTERAC_ENVIRONMENT || 'sandbox',
    data,
    error: error ? { message: error.message, stack: error.stack } : undefined,
  };
  
  console.log(`[Interac Transaction Log]`, JSON.stringify(logEntry, null, 2));
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates the security answer to ensure it meets Interac requirements
 * (no spaces, alphanumeric, 6-25 chars)
 */
export function validateInteracAnswer(answer: string): { valid: boolean; error?: string } {
  const clean = answer.trim();
  
  if (clean.length < 6) {
    return { valid: false, error: "Security answer must be at least 6 characters." };
  }
  
  if (clean.length > 25) {
    return { valid: false, error: "Security answer must not exceed 25 characters." };
  }
  
  if (clean.includes(" ")) {
    return { valid: false, error: "Security answer cannot contain spaces." };
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(clean)) {
    return { valid: false, error: "Security answer must be alphanumeric only." };
  }
  
  return { valid: true };
}

/**
 * Validate security question
 */
export function validateSecurityQuestion(question: string): { valid: boolean; error?: string } {
  const clean = question.trim();
  
  if (clean.length < 10) {
    return { valid: false, error: "Security question must be at least 10 characters." };
  }
  
  if (clean.length > 100) {
    return { valid: false, error: "Security question must not exceed 100 characters." };
  }
  
  return { valid: true };
}

/**
 * Create an Interac e-Transfer with API integration
 */
export async function createInteracTransfer(details: InteracPayoutDetails): Promise<InteracTransferResponse> {
  // Validation
  if (!isValidEmail(details.email)) {
    throw new Error(`Invalid recipient email: ${details.email}`);
  }
  
  if (details.amount <= 0) {
    throw new Error(`Invalid transfer amount: ${details.amount}`);
  }
  
  if (details.amount > 3000) {
    throw new Error("Interac e-Transfer limit is $3,000 CAD per transaction");
  }
  
  const answerValidation = validateInteracAnswer(details.securityAnswer);
  if (!answerValidation.valid) {
    throw new Error(answerValidation.error);
  }
  
  const questionValidation = validateSecurityQuestion(details.securityQuestion);
  if (!questionValidation.valid) {
    throw new Error(questionValidation.error);
  }

  const apiKey = process.env.INTERAC_API_KEY;
  const apiSecret = process.env.INTERAC_API_SECRET;

  if (!apiKey || !apiSecret) {
    // Fallback to manual processing if API credentials not configured
    return prepareManualInteracPayout(details);
  }

  const referenceNumber = details.referenceNumber || `TC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  logTransaction('create_transfer_request', {
    email: details.email,
    amount: details.amount,
    referenceNumber,
  });

  try {
    const result = await retryOperation(async () => {
      const response = await fetch(`${INTERAC_API_BASE}/transfers`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "X-API-Secret": apiSecret,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: details.email,
          recipientName: details.recipientName || "TapCash User",
          amount: details.amount.toFixed(2),
          currency: "CAD",
          securityQuestion: details.securityQuestion,
          securityAnswer: details.securityAnswer,
          referenceNumber,
          message: "Payout from TapCash - Congratulations on your earnings!",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create Interac transfer");
      }

      return (await response.json()) as InteracTransferResponse;
    });

    logTransaction('create_transfer_success', {
      transferId: result.transferId,
      status: result.status,
      referenceNumber: result.referenceNumber,
    });

    return result;
  } catch (error) {
    logTransaction('create_transfer_error', { referenceNumber }, error as Error);
    throw error;
  }
}

/**
 * Get the status of an Interac transfer
 */
export async function getInteracTransferStatus(transferId: string): Promise<InteracTransferResponse> {
  if (!transferId) {
    throw new Error("Transfer ID is required");
  }

  const apiKey = process.env.INTERAC_API_KEY;
  const apiSecret = process.env.INTERAC_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Interac API credentials not configured");
  }

  logTransaction('get_transfer_status_request', { transferId });

  try {
    const result = await retryOperation(async () => {
      const response = await fetch(`${INTERAC_API_BASE}/transfers/${transferId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "X-API-Secret": apiSecret,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch transfer status");
      }

      return (await response.json()) as InteracTransferResponse;
    });

    logTransaction('get_transfer_status_success', {
      transferId,
      status: result.status,
    });

    return result;
  } catch (error) {
    logTransaction('get_transfer_status_error', { transferId }, error as Error);
    throw error;
  }
}

/**
 * Cancel an Interac transfer (if not yet deposited)
 */
export async function cancelInteracTransfer(transferId: string): Promise<InteracTransferResponse> {
  if (!transferId) {
    throw new Error("Transfer ID is required");
  }

  const apiKey = process.env.INTERAC_API_KEY;
  const apiSecret = process.env.INTERAC_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Interac API credentials not configured");
  }

  logTransaction('cancel_transfer_request', { transferId });

  try {
    const result = await retryOperation(async () => {
      const response = await fetch(`${INTERAC_API_BASE}/transfers/${transferId}/cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "X-API-Secret": apiSecret,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel transfer");
      }

      return (await response.json()) as InteracTransferResponse;
    });

    logTransaction('cancel_transfer_success', {
      transferId,
      status: result.status,
    });

    return result;
  } catch (error) {
    logTransaction('cancel_transfer_error', { transferId }, error as Error);
    throw error;
  }
}

/**
 * Fallback: Prepare manual Interac payout (for when API is not configured)
 * @deprecated Use createInteracTransfer with API credentials instead
 */
export async function prepareManualInteracPayout(details: InteracPayoutDetails): Promise<InteracTransferResponse> {
  const ref = `TC-MANUAL-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  
  logTransaction('manual_payout_prepared', {
    referenceNumber: ref,
    email: details.email,
    amount: details.amount,
  });
  
  console.warn(`[INTERAC] Manual payout prepared: ${ref} for ${details.email} ($${details.amount})`);
  console.warn(`[INTERAC] Instructions: Send Interac e-Transfer to ${details.email}`);
  console.warn(`[INTERAC] Security Question: ${details.securityQuestion}`);
  console.warn(`[INTERAC] Security Answer: ${details.securityAnswer}`);
  
  return {
    transferId: ref,
    status: "pending",
    referenceNumber: ref,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use createInteracTransfer instead
 */
export async function prepareInteracPayout(details: InteracPayoutDetails) {
  const result = await createInteracTransfer(details);
  
  return {
    reference: result.referenceNumber,
    status: result.status === "pending" ? "manual_required" : result.status,
    instructions: `Interac e-Transfer sent to ${details.email}`,
    transferId: result.transferId,
  };
}
