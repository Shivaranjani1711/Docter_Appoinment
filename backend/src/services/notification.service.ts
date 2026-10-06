import { Notification, type NOTIFICATION_TYPES } from "../models/Notification";

export async function notify(input: {
  userId: string;
  type: (typeof NOTIFICATION_TYPES)[number];
  title: string;
  body?: string;
  relatedType?: string;
  relatedId?: string;
}) {
  // In-app only for this build (no email/SMS provider wired up yet - see .env.example
  // SMTP_* vars reserved for that). Failing to notify must never fail the parent
  // action, so callers fire-and-forget this and log on error rather than awaiting
  // inside a transaction.
  return Notification.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    relatedType: input.relatedType,
    relatedId: input.relatedId,
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to create notification:", err);
  });
}
