import { env } from "../lib/env";

const TWILIO_BASE = "https://api.twilio.com/2010-04-01";

function getAuth(): { sid: string; token: string } | null {
  const sid = env.twilioAccountSid;
  const token = env.twilioAuthToken;
  if (!sid || sid.includes("your-twilio") || !token || token.includes("your-twilio")) {
    return null;
  }
  return { sid, token };
}

export function hasTwilio(): boolean {
  return getAuth() !== null;
}

interface TwilioResponse {
  success: boolean;
  sid?: string;
  error?: string;
  simulated?: boolean;
}

// ───────────────────────────────────────────────
// Send WhatsApp message via Twilio
// ───────────────────────────────────────────────
export async function sendWhatsApp(params: {
  to: string;
  body: string;
  mediaUrl?: string;
}): Promise<TwilioResponse> {
  const auth = getAuth();
  if (!auth) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const fromNumber = env.twilioWhatsappNumber || `whatsapp:+${auth.sid.slice(0, 11)}`;
    let toNumber = params.to;
    if (!toNumber.startsWith("whatsapp:")) {
      toNumber = `whatsapp:${toNumber}`;
    }

    const formData = new URLSearchParams();
    formData.set("From", fromNumber);
    formData.set("To", toNumber);
    formData.set("Body", params.body);
    if (params.mediaUrl) {
      formData.set("MediaUrl", params.mediaUrl);
    }

    const res = await fetch(`${TWILIO_BASE}/Accounts/${auth.sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${auth.sid}:${auth.token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await res.json() as Record<string, unknown>;

    if (data.error_code || data.status === "failed") {
      return {
        success: false,
        error: String(data.error_message || `Twilio error: ${data.error_code}`),
      };
    }

    return { success: true, sid: String(data.sid ?? "") };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ───────────────────────────────────────────────
// Send SMS via Twilio
// ───────────────────────────────────────────────
export async function sendSMS(params: {
  to: string;
  body: string;
  from?: string;
}): Promise<TwilioResponse> {
  const auth = getAuth();
  if (!auth) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const fromNumber = params.from || auth.sid.slice(0, 11);

    const formData = new URLSearchParams();
    formData.set("From", fromNumber);
    formData.set("To", params.to);
    formData.set("Body", params.body);

    const res = await fetch(`${TWILIO_BASE}/Accounts/${auth.sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${auth.sid}:${auth.token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await res.json() as Record<string, unknown>;

    if (data.error_code || data.status === "failed") {
      return {
        success: false,
        error: String(data.error_message || `Twilio error: ${data.error_code}`),
      };
    }

    return { success: true, sid: String(data.sid ?? "") };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ───────────────────────────────────────────────
// Lookup phone number info
// ───────────────────────────────────────────────
export async function lookupPhone(phone: string): Promise<{
  valid: boolean;
  formatted?: string;
  carrier?: string;
  countryCode?: string;
}> {
  const auth = getAuth();
  if (!auth) {
    return { valid: true, formatted: phone };
  }

  try {
    const res = await fetch(
      `${TWILIO_BASE}/Accounts/${auth.sid}/Lookups/V1/PhoneNumbers/${encodeURIComponent(phone)}?Type=carrier`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${auth.sid}:${auth.token}`).toString("base64")}`,
        },
      }
    );

    if (!res.ok) {
      return { valid: false, formatted: phone };
    }

    const data = await res.json() as Record<string, unknown>;
    const carrier = data.carrier as Record<string, string> | undefined;
    return {
      valid: true,
      formatted: String(data.phone_number ?? phone),
      carrier: carrier?.name,
      countryCode: String(data.country_code ?? ""),
    };
  } catch {
    return { valid: true, formatted: phone };
  }
}

// ───────────────────────────────────────────────
// Get message status
// ───────────────────────────────────────────────
export async function getMessageStatus(messageSid: string): Promise<{
  status: string;
  delivered?: boolean;
  error?: string;
}> {
  const auth = getAuth();
  if (!auth) {
    return { status: "unknown" };
  }

  try {
    const res = await fetch(
      `${TWILIO_BASE}/Accounts/${auth.sid}/Messages/${messageSid}.json`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${auth.sid}:${auth.token}`).toString("base64")}`,
        },
      }
    );

    const data = await res.json() as Record<string, unknown>;
    return {
      status: String(data.status ?? "unknown"),
      delivered: ["delivered", "read"].includes(String(data.status)),
    };
  } catch {
    return { status: "unknown" };
  }
}
