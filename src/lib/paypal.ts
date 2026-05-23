import { adminDb } from "./firebaseAdmin";
import * as admin from "firebase-admin";

/**
 * PayPal REST API Utility for TapCash Payouts
 */

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === "live" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

interface PayPalToken {
  access_token: string;
  expires_in: number;
}

/**
 * Get OAuth2 Access Token from PayPal
 */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal credentials in environment variables.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PayPal Auth Error: ${error.error_description || response.statusText}`);
  }

  const data: PayPalToken = await response.json();
  return data.access_token;
}

/**
 * Create a PayPal Payout request
 */
export async function createPayPalPayout(params: {
  amount: number;
  currency: string;
  recipientEmail: string;
  note: string;
  senderBatchId: string;
}) {
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

  const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("PayPal Payout Request Failed:", data);
    throw new Error(data.message || "PayPal Payout Request Failed");
  }

  return data;
}

/**
 * Check the status of a PayPal Payout
 */
export async function getPayoutStatus(payoutBatchId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts/${payoutBatchId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch payout status");
  }

  return await response.json();
}
