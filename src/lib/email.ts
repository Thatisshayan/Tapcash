import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'TapCash <hello@tapcash.online>';

export async function sendPayoutApprovedEmail(to: string, amountCad: number, method: string, notes?: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: '💸 Your TapCash Payout is on the way!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; border: 1px solid #333;">
          <h1 style="color: #34d399; text-align: center;">Payout Approved!</h1>
          <p style="font-size: 16px; color: #d1d5db;">Great news! Your recent withdrawal request has been approved.</p>
          <div style="background-color: #121212; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #1f2937;">
            <p style="margin: 5px 0; color: #9ca3af;"><strong>Amount:</strong> <span style="color: #fff;">$${amountCad.toFixed(2)} CAD</span></p>
            <p style="margin: 5px 0; color: #9ca3af;"><strong>Method:</strong> <span style="color: #fff; text-transform: uppercase;">${method}</span></p>
            ${notes ? `<p style="margin: 5px 0; color: #9ca3af;"><strong>Note from Admin:</strong> <span style="color: #fbbf24;">${notes}</span></p>` : ''}
          </div>
          <p style="font-size: 14px; color: #9ca3af; text-align: center;">Depending on the method, it may take a few hours to reflect in your account.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://tapcash.online" style="background-color: #10b981; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Return to TapCash</a>
          </div>
        </div>
      `
    });
    console.log(`[EMAIL] Payout approved email sent to ${to}`);
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send payout approved email:', error);
  }
}

export async function sendPayoutRejectedEmail(to: string, amountCad: number, notes?: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: '⚠️ Update regarding your TapCash Payout',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; border: 1px solid #333;">
          <h1 style="color: #ef4444; text-align: center;">Payout Rejected</h1>
          <p style="font-size: 16px; color: #d1d5db;">Unfortunately, your recent withdrawal request for $${amountCad.toFixed(2)} CAD was rejected.</p>
          <div style="background-color: #121212; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #1f2937;">
            <p style="margin: 5px 0; color: #9ca3af;"><strong>Reason:</strong> <span style="color: #fca5a5;">${notes || 'Violation of terms or suspicious activity.'}</span></p>
          </div>
          <p style="font-size: 14px; color: #9ca3af; text-align: center;">The funds have been returned to your TapCash wallet, minus any penalties if applicable. If you believe this is an error, please contact support.</p>
        </div>
      `
    });
    console.log(`[EMAIL] Payout rejected email sent to ${to}`);
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send payout rejected email:', error);
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to TapCash! Start Earning Today 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; border: 1px solid #333;">
          <h1 style="color: #34d399; text-align: center;">Welcome, ${name}!</h1>
          <p style="font-size: 16px; color: #d1d5db;">Thank you for joining TapCash, the premium rewards network.</p>
          <div style="background-color: #121212; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #1f2937;">
            <p style="margin: 5px 0; color: #9ca3af;">You're now ready to start completing offers, taking surveys, and earning free cash.</p>
            <ul style="color: #9ca3af; padding-left: 20px;">
              <li>💰 Complete High-Paying Offers</li>
              <li>🎮 Play Games for Coins</li>
              <li>👥 Refer Friends for 20% Lifetime Earnings</li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://tapcash.online/dashboard" style="background-color: #10b981; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
          </div>
        </div>
      `
    });
    console.log(`[EMAIL] Welcome email sent to ${to}`);
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send welcome email:', error);
  }
}
