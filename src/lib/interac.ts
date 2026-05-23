/**
 * Interac e-Transfer Utility for TapCash
 * Phase 1: Manual processing with validated metadata
 */

export interface InteracPayoutDetails {
  email: string;
  securityQuestion: string;
  securityAnswer: string;
  amount: number;
}

/**
 * Validates the security answer to ensure it meets basic Interac requirements
 * (e.g., no spaces, alphanumeric, 6-25 chars)
 */
export function validateInteracAnswer(answer: string): { valid: boolean; error?: string } {
  const clean = answer.trim();
  if (clean.length < 6) return { valid: false, error: "Security answer must be at least 6 characters." };
  if (clean.includes(" ")) return { valid: false, error: "Security answer cannot contain spaces." };
  return { valid: true };
}

/**
 * Logs an Interac payout request for manual admin fulfillment.
 * In Phase 2, this will connect to a Gigadat or bank API.
 */
export async function prepareInteracPayout(details: InteracPayoutDetails) {
  // Logic for generating unique reference numbers for e-Transfers
  const ref = `TC-INTERAC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  
  console.log(`[INTERAC] Payout prepared: ${ref} for ${details.email} ($${details.amount})`);
  
  return {
    reference: ref,
    status: "manual_required",
    instructions: `Send Interac e-Transfer to ${details.email} with Answer: ${details.securityAnswer}`
  };
}
