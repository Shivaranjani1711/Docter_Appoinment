export const APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "RESCHEDULE_REQUESTED",
  "RESCHEDULED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "EXPIRED",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type TransitionActor = "PATIENT" | "DOCTOR" | "ADMIN" | "SYSTEM";

interface Transition {
  from: AppointmentStatus;
  to: AppointmentStatus;
  allowedActors: TransitionActor[];
}

// Single source of truth for every allowed status change. No controller/service
// may set `Appointment.status` directly - all mutations go through transition().
const TRANSITIONS: Transition[] = [
  { from: "PENDING", to: "CONFIRMED", allowedActors: ["SYSTEM", "ADMIN"] },
  { from: "PENDING", to: "CANCELLED", allowedActors: ["PATIENT", "ADMIN", "SYSTEM"] },
  { from: "PENDING", to: "EXPIRED", allowedActors: ["SYSTEM"] },
  { from: "CONFIRMED", to: "CANCELLED", allowedActors: ["PATIENT", "DOCTOR", "ADMIN"] },
  { from: "CONFIRMED", to: "RESCHEDULE_REQUESTED", allowedActors: ["PATIENT", "DOCTOR", "ADMIN"] },
  { from: "CONFIRMED", to: "CHECKED_IN", allowedActors: ["DOCTOR", "ADMIN"] },
  { from: "CONFIRMED", to: "NO_SHOW", allowedActors: ["SYSTEM"] },
  { from: "RESCHEDULE_REQUESTED", to: "RESCHEDULED", allowedActors: ["DOCTOR", "ADMIN", "SYSTEM"] },
  { from: "RESCHEDULE_REQUESTED", to: "CANCELLED", allowedActors: ["PATIENT", "DOCTOR", "ADMIN"] },
  { from: "RESCHEDULED", to: "CONFIRMED", allowedActors: ["SYSTEM"] },
  { from: "CHECKED_IN", to: "IN_PROGRESS", allowedActors: ["DOCTOR"] },
  { from: "IN_PROGRESS", to: "COMPLETED", allowedActors: ["DOCTOR"] },
];

export function assertTransition(
  from: AppointmentStatus,
  to: AppointmentStatus,
  actor: TransitionActor
): void {
  const match = TRANSITIONS.find((t) => t.from === from && t.to === to);
  if (!match) {
    throw new Error(`Illegal appointment transition: ${from} -> ${to}`);
  }
  if (!match.allowedActors.includes(actor)) {
    throw new Error(`Actor ${actor} may not perform transition ${from} -> ${to}`);
  }
}
