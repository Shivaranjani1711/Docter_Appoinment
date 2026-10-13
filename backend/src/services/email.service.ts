import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for port 465 (SSL), false for 587/others (STARTTLS)
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

function parseSender(emailFrom: string): { name?: string; email: string } {
  // Accepts "Name <email@example.com>" or a bare "email@example.com".
  const match = emailFrom.match(/^(.*)<(.+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, "") || undefined, email: match[2].trim() };
  }
  return { email: emailFrom.trim() };
}

async function sendViaBrevoApi(to: string, subject: string, bodyText: string): Promise<void> {
  const sender = parseSender(env.EMAIL_FROM);
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      textContent: bodyText,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Brevo API send failed (${response.status}): ${detail.slice(0, 300)}`);
  }
}

/**
 * Minimal transactional email abstraction, in order of preference:
 *   1. Brevo's HTTP API (BREVO_API_KEY) - works even when the host blocks
 *      outbound SMTP ports, which Render's free tier does (confirmed via
 *      ETIMEDOUT on the SMTP connection in production logs).
 *   2. Raw SMTP (SMTP_HOST) - works for local dev / hosts that allow SMTP.
 *   3. Console log fallback - fully testable without any provider.
 */
export async function sendEmail(to: string, subject: string, bodyText: string): Promise<void> {
  if (env.BREVO_API_KEY) {
    await sendViaBrevoApi(to, subject, bodyText);
    return;
  }

  if (env.SMTP_HOST) {
    await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text: bodyText,
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`\n[DEV EMAIL] To: ${to}\nSubject: ${subject}\n\n${bodyText}\n`);
}

export function buildClientUrl(path: string): string {
  return `${env.CLIENT_ORIGIN}${path}`;
}
