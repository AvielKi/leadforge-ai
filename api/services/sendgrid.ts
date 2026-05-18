import { env } from "../lib/env";

const SENDGRID_BASE = "https://api.sendgrid.com/v3";

function getApiKey(): string | null {
  const key = env.sendgridApiKey;
  if (!key || key.includes("your-sendgrid")) return null;
  return key;
}

export function hasSendGrid(): boolean {
  return getApiKey() !== null;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

// ───────────────────────────────────────────────
// Send email via SendGrid
// ───────────────────────────────────────────────
export async function sendEmail(params: {
  to: string;
  toName?: string;
  from: string;
  fromName?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<SendResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, error: "SendGrid not configured" };
  }

  try {
    const payload: Record<string, unknown> = {
      personalizations: [
        {
          to: [{ email: params.to, name: params.toName || params.to }],
        },
      ],
      from: { email: params.from, name: params.fromName || params.from },
      subject: params.subject,
      content: [
        { type: "text/plain", value: params.text },
      ],
    };

    if (params.html) {
      (payload.content as Array<{ type: string; value: string }>).push(
        { type: "text/html", value: params.html }
      );
    }

    if (params.replyTo) {
      payload.reply_to = { email: params.replyTo };
    }

    const res = await fetch(`${SENDGRID_BASE}/mail/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMsg = `SendGrid error: ${res.status}`;
      try {
        const errorData = await res.json() as Record<string, unknown>;
        const errors = errorData.errors as Array<{ message?: string }> | undefined;
        if (errors?.[0]?.message) errorMsg = errors[0].message;
      } catch {
        // ignore parse error
      }
      return { success: false, error: errorMsg };
    }

    const messageId = res.headers.get("X-Message-Id") || undefined;
    return { success: true, messageId: messageId || undefined };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ───────────────────────────────────────────────
// Validate email address
// ───────────────────────────────────────────────
export async function validateEmail(email: string): Promise<{
  valid: boolean;
  reason?: string;
}> {
  // Basic regex validation first
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: "Invalid email format" };
  }

  return { valid: true };
}

// ───────────────────────────────────────────────
// Get email stats
// ───────────────────────────────────────────────
export async function getEmailStats(): Promise<{
  requests: number;
  delivered: number;
  opens: number;
  clicks: number;
  bounces: number;
  spamReports: number;
}> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { requests: 0, delivered: 0, opens: 0, clicks: 0, bounces: 0, spamReports: 0 };
  }

  try {
    const startDate = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const res = await fetch(`${SENDGRID_BASE}/stats?aggregated_by=day&start_date=${startDate}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return { requests: 0, delivered: 0, opens: 0, clicks: 0, bounces: 0, spamReports: 0 };
    }

    const data = await res.json() as Array<{
      stats?: Array<{ metrics?: Record<string, number> }>;
    }>;
    const metrics = data[0]?.stats?.[0]?.metrics || {};

    return {
      requests: metrics.requests || 0,
      delivered: metrics.delivered || 0,
      opens: metrics.opens || 0,
      clicks: metrics.clicks || 0,
      bounces: metrics.bounces || 0,
      spamReports: metrics.spam_reports || 0,
    };
  } catch {
    return { requests: 0, delivered: 0, opens: 0, clicks: 0, bounces: 0, spamReports: 0 };
  }
}
