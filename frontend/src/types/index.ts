export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export type SlotType = "ONLINE" | "IN_PERSON";
export type SlotStatus = "OPEN" | "BOOKED" | "BLOCKED";

export interface AppointmentSlot {
  _id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: SlotType;
  status: SlotStatus;
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "RESCHEDULE_REQUESTED"
  | "RESCHEDULED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "EXPIRED";

export interface Appointment {
  _id: string;
  slotId: AppointmentSlot | string;
  patientId: { _id: string; fullName: string } | string;
  doctorId: string;
  type: SlotType;
  originalType: SlotType;
  status: AppointmentStatus;
  problemSummary: string;
  symptoms: string[];
  symptomDurationDays?: number;
  additionalNotes?: string;
  consultationNotes?: string;
  createdAt: string;
}

export interface Doctor {
  _id: string;
  userId: { _id: string; fullName: string };
  specializationId: { _id: string; name: string };
  qualifications: string[];
  experienceYears: number;
  consultationFee: number;
  bio?: string;
  supportsOnline: boolean;
  supportsInPerson: boolean;
  isApproved: boolean;
}

export interface Prescription {
  _id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  diagnosisNotes?: string;
  medicines: { name: string; dosage: string; frequency: string; durationDays?: number; instructions?: string }[];
  advice?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface MedicalReportSummary {
  _id: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  body?: string;
  readAt: string | null;
  createdAt: string;
}
