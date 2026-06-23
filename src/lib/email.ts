import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY?.trim() || "";
const resend =
  resendApiKey
    ? new Resend(resendApiKey)
    : process.env.NODE_ENV === "test"
      ? new Resend("test-key")
      : null;
const FROM_EMAIL = 'TapCash <hello@tapcash.online>';
const BASE = `font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#050816;color:#fff;border-radius:16px;border:1px solid #1e2d4f;`;
const BTN = (href: string, text: string, color = '#00e6c3') =>
  `<div style="text-align:center;margin-top:28px;"><a href="${href}" style="background:${color};color:#050816;padding:14px 30px;text-decoration:none;border-radius:100px;font-weight:900;font-size:14px;display:inline-block;">${text}</a></div>`;

function wrap(body: string) {
  return `<div style="${BASE}">${body}<p style="font-size:11px;color:#334155;text-align:center;margin-top:28px;">TapCash | hello@tapcash.online | <a href="https://tapcash.online" style="color:#334155;">tapcash.online</a></p></div>`;
}

function getEmailClient(context: string) {
  if (resend) return resend;

  console.error(`[EMAIL] ${context}: RESEND_API_KEY is missing. Skipping send to avoid masking misconfiguration.`);
  return null;
}

export async function sendWelcomeEmail(to: string, name: string) {
  const client = getEmailClient("sendWelcomeEmail");
  if (!client) return;

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to TapCash - Start Earning Now',
      html: wrap(`
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:52px;">Target</span>
          <h1 style="color:#00e6c3;font-size:28px;margin:12px 0 4px;">Welcome, ${name}!</h1>
          <p style="color:#64748b;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;">Your earning journey starts now</p>
        </div>
        <div style="background:#080c1a;padding:20px;border-radius:12px;border:1px solid #1e2d4f;margin-bottom:20px;">
          <p style="color:#94a3b8;margin:0 0 12px;">Here is what to do first:</p>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span>Cash</span><span style="color:#e2e8f0;font-size:14px;"><strong>Complete RapidoReach surveys</strong> - up to 2,000 coins each</span></div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><span>Streak</span><span style="color:#e2e8f0;font-size:14px;"><strong>Log in daily</strong> - build your streak for bonus coins</span></div>
          <div style="display:flex;align-items:center;gap:10px;"><span>Team</span><span style="color:#e2e8f0;font-size:14px;"><strong>Refer friends</strong> - earn 20% of their coins forever</span></div>
        </div>
        ${BTN('https://tapcash.online/dashboard', 'Open My Dashboard', '#00e6c3')}
      `),
    });
    console.log(`[EMAIL] Welcome sent -> ${to}`);
  } catch (err) {
    console.error('[EMAIL] sendWelcomeEmail:', err);
  }
}

export async function sendStreakReminderEmail(to: string, name: string, streakDay: number) {
  const client = getEmailClient("sendStreakReminderEmail");
  if (!client) return;

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Day ${streakDay} streak - log in before midnight!`,
      html: wrap(`
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:52px;">Streak</span>
          <h1 style="color:#f5c842;font-size:26px;margin:12px 0 4px;">Your streak is alive, ${name}!</h1>
          <p style="color:#64748b;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;">Day ${streakDay} | Do not break the chain</p>
        </div>
        <div style="background:#080c1a;padding:20px;border-radius:12px;border:1px solid #1e2d4f;margin-bottom:20px;text-align:center;">
          <p style="color:#94a3b8;margin:0 0 8px;font-size:14px;">Your current streak: <strong style="color:#f5c842;">${streakDay} days</strong></p>
          <p style="color:#94a3b8;margin:0;font-size:13px;">Log in before midnight UTC to keep it going. Day 7 unlocks a <strong style="color:#f5c842;">free jackpot spin</strong>.</p>
        </div>
        ${BTN('https://tapcash.online/dashboard', 'Claim Today\'s Bonus', '#f5c842')}
      `),
    });
    console.log(`[EMAIL] Streak reminder sent -> ${to}`);
  } catch (err) {
    console.error('[EMAIL] sendStreakReminderEmail:', err);
  }
}

export async function sendCashoutNudgeEmail(to: string, name: string, coinBalance: number) {
  const cadValue = (coinBalance / 1000).toFixed(2);
  const client = getEmailClient("sendCashoutNudgeEmail");
  if (!client) return;

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `You have $${cadValue} CAD ready to cash out`,
      html: wrap(`
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:52px;">Payout</span>
          <h1 style="color:#3a7bff;font-size:26px;margin:12px 0 4px;">Time to cash out, ${name}!</h1>
          <p style="color:#64748b;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;">Your balance is waiting</p>
        </div>
        <div style="background:#080c1a;padding:20px;border-radius:12px;border:1px solid #1e2d4f;margin-bottom:20px;text-align:center;">
          <p style="color:#94a3b8;margin:0 0 8px;font-size:14px;">Current balance: <strong style="color:#f5c842;">${coinBalance.toLocaleString()} coins</strong></p>
          <p style="color:#94a3b8;margin:0 0 16px;font-size:13px;">Approx. <strong style="color:#fff;">$${cadValue} CAD</strong></p>
          <p style="color:#64748b;font-size:12px;margin:0;">PayPal | Interac e-Transfer | Bitcoin | Gift Cards</p>
        </div>
        ${BTN('https://tapcash.online/cashout', 'Request Payout Now', '#3a7bff')}
      `),
    });
    console.log(`[EMAIL] Cashout nudge sent -> ${to}`);
  } catch (err) {
    console.error('[EMAIL] sendCashoutNudgeEmail:', err);
  }
}

export async function sendPayoutApprovedEmail(to: string, amountCad: number, method: string, notes?: string) {
  const client = getEmailClient("sendPayoutApprovedEmail");
  if (!client) return;

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your TapCash payout is on its way!',
      html: wrap(`
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:52px;">Approved</span>
          <h1 style="color:#00e6c3;font-size:26px;margin:12px 0 4px;">Payout Approved!</h1>
          <p style="color:#64748b;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;">Your money is moving</p>
        </div>
        <div style="background:#080c1a;padding:20px;border-radius:12px;border:1px solid #1e2d4f;margin-bottom:20px;">
          <p style="margin:6px 0;color:#94a3b8;font-size:14px;"><strong>Amount:</strong> <span style="color:#fff;">$${amountCad.toFixed(2)} CAD</span></p>
          <p style="margin:6px 0;color:#94a3b8;font-size:14px;"><strong>Method:</strong> <span style="color:#fff;text-transform:capitalize;">${method}</span></p>
          ${notes ? `<p style="margin:6px 0;color:#94a3b8;font-size:14px;"><strong>Note:</strong> <span style="color:#f5c842;">${notes}</span></p>` : ''}
          <p style="margin:12px 0 0;color:#475569;font-size:12px;">Allow a few hours for the transfer to arrive depending on your payment method.</p>
        </div>
        ${BTN('https://tapcash.online/cashout/status', 'Track Payout Status', '#00e6c3')}
      `),
    });
    console.log(`[EMAIL] Payout approved -> ${to}`);
  } catch (err) {
    console.error('[EMAIL] sendPayoutApprovedEmail:', err);
  }
}

export async function sendPayoutSentEmail(to: string, amountCad: number, method: string, referenceNumber?: string) {
  const client = getEmailClient("sendPayoutSentEmail");
  if (!client) return;

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Your TapCash payout has been sent!',
      html: wrap(`
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:52px;">Sent</span>
          <h1 style="color:#3a7bff;font-size:26px;margin:12px 0 4px;">Payout Sent!</h1>
          <p style="color:#64748b;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;">Funds are on the way</p>
        </div>
        <div style="background:#080c1a;padding:20px;border-radius:12px;border:1px solid #1e2d4f;margin-bottom:20px;">
          <p style="margin:6px 0;color:#94a3b8;font-size:14px;"><strong>Amount:</strong> <span style="color:#fff;">$${amountCad.toFixed(2)} CAD</span></p>
          <p style="margin:6px 0;color:#94a3b8;font-size:14px;"><strong>Method:</strong> <span style="color:#fff;text-transform:capitalize;">${method}</span></p>
          ${referenceNumber ? `<p style="margin:6px 0;color:#94a3b8;font-size:14px;"><strong>Reference:</strong> <span style="color:#f5c842;">${referenceNumber}</span></p>` : ''}
          <p style="margin:12px 0 0;color:#475569;font-size:12px;">Check your payment method for the deposit. Contact support if it does not arrive within the expected window.</p>
        </div>
        ${BTN('https://tapcash.online/cashout/status', 'Track Payout', '#3a7bff')}
      `),
    });
    console.log(`[EMAIL] Payout sent -> ${to}`);
  } catch (err) {
    console.error('[EMAIL] sendPayoutSentEmail:', err);
  }
}

export async function sendPayoutRejectedEmail(to: string, amountCad: number, notes?: string) {
  const client = getEmailClient("sendPayoutRejectedEmail");
  if (!client) return;

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Update on your TapCash payout request',
      html: wrap(`
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:52px;">Action</span>
          <h1 style="color:#ef4444;font-size:26px;margin:12px 0 4px;">Payout Not Approved</h1>
          <p style="color:#64748b;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;">Action required</p>
        </div>
        <div style="background:#080c1a;padding:20px;border-radius:12px;border:1px solid #1e2d4f;margin-bottom:20px;">
          <p style="margin:6px 0;color:#94a3b8;font-size:14px;"><strong>Requested:</strong> $${amountCad.toFixed(2)} CAD</p>
          <p style="margin:6px 0;color:#94a3b8;font-size:14px;"><strong>Reason:</strong> <span style="color:#fca5a5;">${notes || 'Terms violation or suspicious activity detected.'}</span></p>
          <p style="margin:12px 0 0;color:#475569;font-size:12px;">Coins have been returned to your wallet. Contact support if you believe this is an error.</p>
        </div>
        ${BTN('https://tapcash.online/dashboard', 'Return to Dashboard', '#ef4444')}
      `),
    });
    console.log(`[EMAIL] Payout rejected -> ${to}`);
  } catch (err) {
    console.error('[EMAIL] sendPayoutRejectedEmail:', err);
  }
}
