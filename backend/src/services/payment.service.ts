import crypto from "crypto";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment";
import { AppointmentSlot } from "../models/AppointmentSlot";
import { DoctorProfile } from "../models/DoctorProfile";
import { Payment } from "../models/Payment";
import { getRazorpayClient } from "./razorpayClient";
import { transitionAppointment } from "./appointmentTransition.service";
import { ApiError, Errors } from "../utils/ApiError";
import { env } from "../config/env";

export async function createPaymentOrder(appointmentId: string, patientId: string) {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw Errors.notFound("Appointment");
  if (appointment.patientId.toString() !== patientId) throw Errors.forbidden();
  if (appointment.status !== "PENDING") {
    throw new ApiError(422, "NOT_PAYABLE", "This appointment is not awaiting payment");
  }

  // Prevent duplicate payment: if an order already exists and isn't failed, reuse it
  // instead of creating a second one for the same appointment.
  const existing = await Payment.findOne({ appointmentId, status: { $in: ["CREATED", "SUCCESS"] } });
  if (existing) {
    return { orderId: existing.gatewayOrderId, amount: existing.amount, currency: existing.currency };
  }

  const doctor = await DoctorProfile.findById(appointment.doctorId);
  if (!doctor) throw Errors.notFound("Doctor");

  const amountPaise = Math.round(doctor.consultationFee * 100);
  const order = await getRazorpayClient().orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: appointment._id.toString(),
  });

  await Payment.create({
    appointmentId: appointment._id,
    patientId,
    amount: amountPaise,
    currency: "INR",
    status: "CREATED",
    gatewayOrderId: order.id,
  });

  return { orderId: order.id, amount: amountPaise, currency: "INR", keyId: env.RAZORPAY_KEY_ID };
}

export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  // Constant-time comparison to avoid a timing side-channel on signature checks.
  return (
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  );
}

interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment: {
      entity: { id: string; order_id: string; status: string };
    };
  };
}

export async function handleWebhookEvent(event: RazorpayWebhookEvent): Promise<void> {
  const paymentEntity = event.payload?.payment?.entity;
  if (!paymentEntity) return;

  const payment = await Payment.findOne({ gatewayOrderId: paymentEntity.order_id });
  if (!payment) return; // Unknown order - ignore rather than error, keeps webhook idempotent/safe.

  if (payment.status !== "CREATED") return; // Already handled - idempotent no-op on retry/duplicate webhook.

  if (event.event === "payment.captured") {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        payment.status = "SUCCESS";
        payment.gatewayPaymentId = paymentEntity.id;
        await payment.save({ session });

        const appointment = await Appointment.findById(payment.appointmentId).session(session);
        if (appointment && appointment.status === "PENDING") {
          await transitionAppointment({
            appointmentId: appointment._id.toString(),
            to: "CONFIRMED",
            actor: "SYSTEM",
            reason: "Payment captured",
            session,
          });
        }
      });
    } finally {
      await session.endSession();
    }
  } else if (event.event === "payment.failed") {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        payment.status = "FAILED";
        payment.failureReason = "Payment failed at gateway";
        await payment.save({ session });

        const appointment = await Appointment.findById(payment.appointmentId).session(session);
        if (appointment && appointment.status === "PENDING") {
          await transitionAppointment({
            appointmentId: appointment._id.toString(),
            to: "CANCELLED",
            actor: "SYSTEM",
            reason: "Payment failed",
            session,
          });
          await AppointmentSlot.updateOne(
            { _id: appointment.slotId, status: "BOOKED" },
            { $set: { status: "OPEN" } },
            { session }
          );
        }
      });
    } finally {
      await session.endSession();
    }
  }
}
