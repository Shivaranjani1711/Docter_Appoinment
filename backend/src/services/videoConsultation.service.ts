import crypto from "crypto";
import { Appointment } from "../models/Appointment";
import { AppointmentSlot } from "../models/AppointmentSlot";
import { VideoConsultation } from "../models/VideoConsultation";
import { JitsiVideoProvider } from "./video/jitsiProvider";
import { slotStartDateTime, slotEndDateTime } from "../utils/slotDateTime";
import { POLICY } from "../config/policy";
import { ApiError, Errors } from "../utils/ApiError";

const provider = new JitsiVideoProvider();

interface JoinInput {
  appointmentId: string;
  userId: string;
  userName: string;
  isDoctor: boolean;
}

export async function joinVideoConsultation(input: JoinInput) {
  const appointment = await Appointment.findById(input.appointmentId);
  if (!appointment) throw Errors.notFound("Appointment");

  if (appointment.type !== "ONLINE") {
    throw new ApiError(422, "NOT_ONLINE_APPOINTMENT", "This appointment is not an online consultation");
  }
  if (!["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(appointment.status)) {
    throw new ApiError(422, "NOT_JOINABLE", "This consultation is not currently joinable");
  }

  const slot = await AppointmentSlot.findById(appointment.slotId);
  if (!slot) throw Errors.notFound("Slot");

  const windowStart = new Date(
    slotStartDateTime(slot).getTime() - POLICY.VIDEO_ROOM_OPENS_MINUTES_BEFORE * 60 * 1000
  );
  const windowEnd = slotEndDateTime(slot);
  const now = new Date();

  if (now < windowStart) {
    throw new ApiError(
      422,
      "TOO_EARLY",
      `This consultation room opens ${POLICY.VIDEO_ROOM_OPENS_MINUTES_BEFORE} minutes before the scheduled time.`
    );
  }
  if (now > windowEnd) {
    throw new ApiError(410, "WINDOW_EXPIRED", "This consultation's time window has passed.");
  }

  let consultation = await VideoConsultation.findOne({ appointmentId: appointment._id });
  if (!consultation) {
    const roomName = `apt-${appointment._id.toString()}-${crypto.randomBytes(4).toString("hex")}`;
    const room = await provider.createRoom({ roomName, expiresAt: windowEnd });
    consultation = await VideoConsultation.create({
      appointmentId: appointment._id,
      roomName: room.roomName,
      roomUrl: room.roomUrl,
      status: "PENDING",
      windowStart,
      windowEnd,
    });
  }

  if (consultation.status === "ENDED" || consultation.status === "EXPIRED") {
    throw new ApiError(410, "CONSULTATION_ENDED", "This consultation has already ended.");
  }

  const token = await provider.createMeetingToken({
    roomName: consultation.roomName,
    userName: input.userName,
    isOwner: input.isDoctor,
    expiresAt: windowEnd,
  });

  if (consultation.status === "PENDING") {
    consultation.status = "ACTIVE";
    consultation.startedAt = consultation.startedAt ?? new Date();
    await consultation.save();
  }

  return { roomUrl: consultation.roomUrl, token, expiresAt: windowEnd };
}

export async function endVideoConsultation(appointmentId: string) {
  const consultation = await VideoConsultation.findOne({ appointmentId });
  if (!consultation) throw Errors.notFound("Video consultation");

  consultation.status = "ENDED";
  consultation.endedAt = new Date();
  await consultation.save();
  await provider.deleteRoom(consultation.roomName).catch(() => undefined);
  return consultation;
}
