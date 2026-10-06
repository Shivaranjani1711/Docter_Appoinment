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

/**
 * Minimal transactional email abstraction. Without SMTP_HOST configured (see
 * .env.example), this falls back to logging the email to the console so the
 * verification/reset flow is fully testable in development without any
 * provider. Once SMTP_HOST is set, real email is sent via nodemailer.
 */
export async function sendEmail(to: string, subject: string, bodyText: string): Promise<void> {
  if (!env.SMTP_HOST) {
    // eslint-disable-next-line no-console
    console.log(`\n[DEV EMAIL] To: ${to}\nSubject: ${subject}\n\n${bodyText}\n`);
    return;
  }

  await getTransporter().sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text: bodyText,
  });
}

export function buildClientUrl(path: string): string {
  return `${env.CLIENT_ORIGIN}${path}`;
}
