// Pluggable SMS sender. Configure via env (SMS_PROVIDER):
//   none   -> simulated (logs only) — default, lets the feature work without a contract
//   twilio -> Twilio REST API (SMS_TWILIO_SID, SMS_TWILIO_TOKEN, SMS_FROM)
//   http   -> generic JSON POST (SMS_HTTP_URL, optional SMS_HTTP_AUTH, SMS_FROM)
const PROVIDER = (process.env.SMS_PROVIDER || 'none').toLowerCase();
const FROM = process.env.SMS_FROM || 'PhoBamboo';

export const smsProvider = PROVIDER;
export const smsConfigured = () => PROVIDER !== 'none';

export async function sendSms(to, message) {
  if (!to) return { ok: false, error: 'no recipient' };

  if (PROVIDER === 'twilio') {
    const sid = process.env.SMS_TWILIO_SID;
    const token = process.env.SMS_TWILIO_TOKEN;
    const body = new URLSearchParams({ To: to, From: FROM, Body: message });
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (!r.ok) return { ok: false, error: `twilio ${r.status}` };
    return { ok: true };
  }

  if (PROVIDER === 'http') {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.SMS_HTTP_AUTH) headers.Authorization = process.env.SMS_HTTP_AUTH;
    const r = await fetch(process.env.SMS_HTTP_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ from: FROM, to, message }),
    });
    if (!r.ok) return { ok: false, error: `http ${r.status}` };
    return { ok: true };
  }

  // none — simulate so the campaign flow is testable without a provider.
  console.log(`[SMS:simulé] -> ${to}: ${message}`);
  return { ok: true, simulated: true };
}
