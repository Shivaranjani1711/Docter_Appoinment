import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import {
  createAdminSchema,
  createDepartmentSchema,
  createSpecializationSchema,
  setDoctorApprovalSchema,
  setUserActiveSchema,
} from "../validators/admin.validators";
import {
  createAdminUser,
  createDepartment,
  createSpecialization,
  listAllAppointments,
  listAllDoctors,
  listAllPatients,
  listAuditLogs,
  listDepartments,
  listSpecializations,
  setDoctorApproval,
  setUserActive,
} from "../controllers/admin.controller";
import { overview, specializationDistribution, trend } from "../controllers/analytics.controller";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/departments", listDepartments);
router.post("/departments", validateBody(createDepartmentSchema), createDepartment);
router.get("/specializations", listSpecializations);
router.post("/specializations", validateBody(createSpecializationSchema), createSpecialization);

router.get("/doctors", listAllDoctors);
router.post("/doctors/:id/approval", validateBody(setDoctorApprovalSchema), setDoctorApproval);
router.get("/patients", listAllPatients);
router.post("/users/:id/active", validateBody(setUserActiveSchema), setUserActive);

router.get("/appointments", listAllAppointments);
router.get("/audit-logs", listAuditLogs);

router.get("/analytics/overview", overview);
router.get("/analytics/trend", trend);
router.get("/analytics/specializations", specializationDistribution);

router.post("/admins", validateBody(createAdminSchema), createAdminUser);

export default router;
