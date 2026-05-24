// src/lib/tremendous.ts

// Tremendous API Base URL (Sandbox by default for safety, override with TREMENDOUS_ENV in prod)
const TREMENDOUS_ENV = process.env.TREMENDOUS_ENV || 'sandbox';
const BASE_URL = TREMENDOUS_ENV === 'production' 
  ? 'https://api.tremendous.com/api/v2' 
  : 'https://testflight.tremendous.com/api/v2';

export interface TremendousOrderOptions {
  recipientEmail: string;
  recipientName?: string;
  amount: number;
  currency?: string;
  method: string;
}

export async function createTremendousOrder({
  recipientEmail,
  recipientName = "TapCash User",
  amount,
  currency = "USD", // Defaults to USD for most generic Tremendous accounts, but can be CAD if configured.
}: TremendousOrderOptions) {
  const apiKey = process.env.TREMENDOUS_API_KEY;
  const campaignId = process.env.TREMENDOUS_CAMPAIGN_ID;

  if (!apiKey || !campaignId) {
    throw new Error('Tremendous API credentials (TREMENDOUS_API_KEY, TREMENDOUS_CAMPAIGN_ID) are missing from environment variables.');
  }

  const payload = {
    payment: {
      funding_source_id: "BALANCE" // Deducts from your pre-funded Tremendous balance
    },
    reward: {
      campaign_id: campaignId,
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
    console.error('Tremendous API Error:', responseData);
    throw new Error(JSON.stringify(responseData.errors) || 'Failed to create Tremendous order.');
  }

  return responseData.order; // Returns the order details including order.id
}
