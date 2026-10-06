const STYLES: Record<string, string> = {
  PENDING: "bg-warning-50 text-warning-600",
  CONFIRMED: "bg-success-50 text-success-600",
  RESCHEDULE_REQUESTED: "bg-warning-50 text-warning-600",
  RESCHEDULED: "bg-brand-50 text-brand-700",
  CHECKED_IN: "bg-brand-50 text-brand-700",
  IN_PROGRESS: "bg-brand-50 text-brand-700",
  COMPLETED: "bg-success-50 text-success-600",
  CANCELLED: "bg-ink-100 text-ink-600",
  NO_SHOW: "bg-danger-50 text-danger-600",
  EXPIRED: "bg-ink-100 text-ink-600",
  OPEN: "bg-success-50 text-success-600",
  BOOKED: "bg-ink-100 text-ink-600",
  BLOCKED: "bg-danger-50 text-danger-600",
  WAITING: "bg-warning-50 text-warning-600",
  ACCEPTED: "bg-brand-50 text-brand-700",
};

const LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  RESCHEDULE_REQUESTED: "Reschedule requested",
  RESCHEDULED: "Rescheduled",
  CHECKED_IN: "Checked in",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
  EXPIRED: "Expired",
  OPEN: "Open",
  BOOKED: "Booked",
  BLOCKED: "Blocked",
  WAITING: "Waiting",
  ACCEPTED: "Accepted",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STYLES[status] ?? "bg-ink-100 text-ink-600"}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
