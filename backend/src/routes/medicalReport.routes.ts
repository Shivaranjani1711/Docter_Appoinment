import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { uploadSingleReport } from "../middlewares/upload";
import {
  downloadReport,
  listMyReports,
  listPatientReportsForDoctor,
  uploadReport,
} from "../controllers/medicalReport.controller";

const router = Router();

router.use(requireAuth);

router.post("/", requireRole("PATIENT"), uploadSingleReport, uploadReport);
router.get("/", requireRole("PATIENT"), listMyReports);
router.get("/patient/:patientId", requireRole("DOCTOR", "ADMIN"), listPatientReportsForDoctor);
router.get("/:id/file", downloadReport);

export default router;
