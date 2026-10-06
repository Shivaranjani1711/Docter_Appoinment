import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import doctorRoutes from "./doctor.routes";
import appointmentRoutes from "./appointment.routes";
import medicalReportRoutes from "./medicalReport.routes";
import prescriptionRoutes from "./prescription.routes";
import videoConsultationRoutes from "./videoConsultation.routes";
import emergencyRoutes from "./emergency.routes";
import paymentRoutes from "./payment.routes";
import notificationRoutes from "./notification.routes";
import adminRoutes from "./admin.routes";
import taxonomyRoutes from "./taxonomy.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/medical-reports", medicalReportRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/video-consultations", videoConsultationRoutes);
router.use("/emergency-requests", emergencyRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.use("/", taxonomyRoutes);

export default router;
