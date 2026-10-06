import { Appointment } from "../models/Appointment";
import { Prescription } from "../models/Prescription";
import { ApiError, Errors } from "../utils/ApiError";
import { parseDateOnly } from "../utils/time";

interface CreatePrescriptionInput {
  doctorId: string; // DoctorProfile id
  appointmentId: string;
  diagnosisNotes?: string;
  medicines: { name: string; dosage: string; frequency: string; durationDays?: number; instructions?: string }[];
  advice?: string;
  followUpDate?: string;
}

export async function createPrescription(input: CreatePrescriptionInput) {
  const appointment = await Appointment.findById(input.appointmentId);
  if (!appointment) throw Errors.notFound("Appointment");

  if (appointment.doctorId.toString() !== input.doctorId) {
    throw Errors.forbidden();
  }
  if (!["IN_PROGRESS", "COMPLETED"].includes(appointment.status)) {
    throw new ApiError(
      422,
      "APPOINTMENT_NOT_READY",
      "A prescription can only be created once the consultation has started"
    );
  }

  const existing = await Prescription.findOne({ appointmentId: appointment._id });
  if (existing) {
    throw new ApiError(409, "PRESCRIPTION_EXISTS", "A prescription already exists for this appointment");
  }

  return Prescription.create({
    appointmentId: appointment._id,
    doctorId: appointment.doctorId,
    patientId: appointment.patientId,
    diagnosisNotes: input.diagnosisNotes,
    medicines: input.medicines,
    advice: input.advice,
    followUpDate: input.followUpDate ? parseDateOnly(input.followUpDate) : null,
  });
}
