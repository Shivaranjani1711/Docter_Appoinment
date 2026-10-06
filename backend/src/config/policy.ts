// Centralized business-rule constants. These are deliberately NOT scattered across
// services so a single admin-settings screen can later make them configurable
// without hunting through the codebase. Hardcoded defaults for now - see Phase 11.
export const POLICY = {
  CANCELLATION_CUTOFF_HOURS: 2, // patient cannot cancel within this many hours of the slot
  RESCHEDULE_CUTOFF_HOURS: 2,
  CONVERSION_CUTOFF_HOURS: 4, // in-person -> video conversion must be requested before this cutoff
  REQUIRES_DOCTOR_APPROVAL_FOR_CONVERSION: false,
  NO_SHOW_GRACE_MINUTES: 15,
  PENDING_PAYMENT_TTL_MINUTES: 10, // unpaid PENDING appointments auto-expire after this
  EMERGENCY_REQUEST_TIMEOUT_MINUTES: 5,
  VIDEO_ROOM_OPENS_MINUTES_BEFORE: 10,
};
