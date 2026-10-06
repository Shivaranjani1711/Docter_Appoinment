import crypto from "crypto";
import { EmergencyRequest } from "../models/EmergencyRequest";
import { VideoConsultation } from "../models/VideoConsultation";
import { DoctorProfile } from "../models/DoctorProfile";
import { JitsiVideoProvider } from "./video/jitsiProvider";
import { ApiError, Errors } from "../utils/ApiError";
import { POLICY } from "../config/policy";

const provider = new JitsiVideoProvider();

export async function createEmergencyRequest(patientId: string, input: {
  specializationId?: string;
  problemSummary: string;
}) {
  const expiresAt = new Date(Date.now() + POLICY.EMERGENCY_REQUEST_TIMEOUT_MINUTES * 60 * 1000);
  return EmergencyRequest.create({
    patientId,
    specializationId: input.specializationId ?? null,
    problemSummary: input.problemSummary,
    status: "WAITING",
    expiresAt,
  });
}

export async function listOpenRequestsForDoctor(doctorUserId: string) {
  const doctor = await DoctorProfile.findOne({ userId: doctorUserId });
  if (!doctor || !doctor.supportsOnline) return [];

  return EmergencyRequest.find({
    status: "WAITING",
    expiresAt: { $gt: new Date() },
    $or: [{ specializationId: null }, { specializationId: doctor.specializationId }],
  }).sort({ createdAt: 1 });
}

export async function acceptEmergencyRequest(requestId: string, doctorUserId: string) {
  const doctor = await DoctorProfile.findOne({ userId: doctorUserId });
  if (!doctor) throw Errors.notFound("Doctor profile");

  // Atomic compare-and-swap: only the first doctor to accept wins; everyone else
  // gets a clean 409, mirroring the same concurrency pattern as slot booking.
  const request = await EmergencyRequest.findOneAndUpdate(
    { _id: requestId, status: "WAITING" },
    { $set: { status: "ACCEPTED", acceptedDoctorId: doctor._id, respondedAt: new Date() } },
    { new: true }
  );
  if (!request) {
    throw new ApiError(409, "REQUEST_UNAVAILABLE", "This request has already been accepted, cancelled, or expired.");
  }

  const roomName = `emergency-${request._id.toString()}-${crypto.randomBytes(4).toString("hex")}`;
  const windowEnd = new Date(Date.now() + 60 * 60 * 1000); // 1 hour ceiling on an emergency session
  const room = await provider.createRoom({ roomName, expiresAt: windowEnd });
  const consultation = await VideoConsultation.create({
    appointmentId: null,
    provider: "daily",
    roomName: room.roomName,
    roomUrl: room.roomUrl,
    status: "ACTIVE",
    windowStart: new Date(),
    windowEnd,
    startedAt: new Date(),
  });

  request.videoConsultationId = consultation._id as any;
  request.status = "IN_PROGRESS";
  await request.save();

  return request;
}

export async function cancelEmergencyRequest(requestId: string, patientId: string) {
  const request = await EmergencyRequest.findOneAndUpdate(
    { _id: requestId, patientId, status: "WAITING" },
    { $set: { status: "CANCELLED" } },
    { new: true }
  );
  if (!request) {
    throw new ApiError(422, "CANNOT_CANCEL", "This request can no longer be cancelled.");
  }
  return request;
}

export async function completeEmergencyRequest(requestId: string, doctorUserId: string) {
  const doctor = await DoctorProfile.findOne({ userId: doctorUserId });
  if (!doctor) throw Errors.notFound("Doctor profile");

  const request = await EmergencyRequest.findOneAndUpdate(
    { _id: requestId, acceptedDoctorId: doctor._id, status: "IN_PROGRESS" },
    { $set: { status: "COMPLETED", completedAt: new Date() } },
    { new: true }
  );
  if (!request) throw Errors.notFound("Emergency request");
  return request;
}

export async function expireStaleEmergencyRequests() {
  await EmergencyRequest.updateMany(
    { status: "WAITING", expiresAt: { $lt: new Date() } },
    { $set: { status: "EXPIRED" } }
  );
}
