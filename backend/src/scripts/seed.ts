import crypto from "crypto";
import { connectDatabase } from "../config/db";
import { Hospital } from "../models/Hospital";
import { Department, Specialization } from "../models/Department";
import { User } from "../models/User";
import { hashPassword } from "../utils/password";
import mongoose from "mongoose";

/**
 * One-time setup for a fresh environment: the single Hospital row, a starter
 * department/specialization taxonomy (DEMO data, safe to edit/delete via the
 * admin UI afterwards), and exactly one bootstrap admin account - required
 * because admins cannot self-register (see auth.validators.ts).
 */
async function seed() {
  await connectDatabase();

  const hospitalCount = await Hospital.countDocuments();
  if (hospitalCount === 0) {
    await Hospital.create({
      name: "CONFIGURE_HOSPITAL_NAME",
      address: "CONFIGURE_HOSPITAL_ADDRESS",
      contactEmail: "CONFIGURE_CONTACT_EMAIL",
      contactPhone: "CONFIGURE_CONTACT_PHONE",
    });
    console.log("Created placeholder Hospital record - update it from the admin dashboard.");
  }

  const departmentNames = ["General Medicine", "Cardiology", "Dermatology", "Pediatrics"];
  for (const name of departmentNames) {
    const department = await Department.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { upsert: true, new: true }
    );
    const specName = `${name} Consultation`;
    await Specialization.findOneAndUpdate(
      { departmentId: department._id, name: specName },
      { $setOnInsert: { departmentId: department._id, name: specName } },
      { upsert: true }
    );
  }
  console.log("Ensured starter departments/specializations exist (DEMO data - edit freely).");

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const generatedPassword = process.env.SEED_ADMIN_PASSWORD ?? crypto.randomBytes(9).toString("base64url");
    const passwordHash = await hashPassword(generatedPassword);
    await User.create({
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      fullName: "Platform Administrator",
      isEmailVerified: true,
    });
    console.log("=".repeat(60));
    console.log("Bootstrap admin account created:");
    console.log(`  email:    ${adminEmail}`);
    console.log(`  password: ${generatedPassword}`);
    console.log("Log in and change this password immediately.");
    console.log("=".repeat(60));
  } else {
    console.log(`Admin ${adminEmail} already exists - skipping.`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
