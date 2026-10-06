import { Appointment } from "../models/Appointment";
import { resolveOwnDoctorProfileId } from "./doctorProfile.helpers";
import type { UserRole } from "../models/User";

/**
 * Object-level authorization for patient medical data (reports, prescriptions,
 * consultation context): the patient themself, a doctor who has at least one
 * appointment with that patient, or an admin. This is the single check every
 * medical-record endpoint must call before returning data - never trust a
 * route being "for doctors" alone (that is role-level, not object-level).
 */
export async function canAccessPatientRecords(
  viewerRole: UserRole,
  viewerUserId: string,
  patientId: string
): Promise<boolean> {
  if (viewerRole === "ADMIN") return true;
  if (viewerRole === "PATIENT") return viewerUserId === patientId;
  if (viewerRole === "DOCTOR") {
    const doctorId = await resolveOwnDoctorProfileId(viewerUserId);
    const exists = await Appointment.exists({ doctorId, patientId });
    return Boolean(exists);
  }
  return false;
}
