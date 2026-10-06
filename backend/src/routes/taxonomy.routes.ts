import { Router } from "express";
import { Department, Specialization } from "../models/Department";

const router = Router();

// Public read-only listing - needed so patients can filter doctor search and
// doctors can pick a specialization when completing their profile. Writes to
// these collections remain admin-only (see admin.routes.ts).
router.get("/departments", async (_req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  res.status(200).json({ departments });
});

router.get("/specializations", async (req, res) => {
  const filter = req.query.departmentId ? { departmentId: req.query.departmentId } : {};
  const specializations = await Specialization.find(filter).sort({ name: 1 });
  res.status(200).json({ specializations });
});

export default router;
