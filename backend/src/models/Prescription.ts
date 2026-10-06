import { Schema, model, Types } from "mongoose";

const prescriptionMedicineSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 200 },
    dosage: { type: String, required: true, maxlength: 100 },
    frequency: { type: String, required: true, maxlength: 100 },
    durationDays: { type: Number, min: 1 },
    instructions: { type: String, maxlength: 300 },
  },
  { _id: false }
);

const prescriptionSchema = new Schema(
  {
    appointmentId: { type: Types.ObjectId, ref: "Appointment", required: true, unique: true },
    doctorId: { type: Types.ObjectId, ref: "DoctorProfile", required: true },
    patientId: { type: Types.ObjectId, ref: "User", required: true },
    diagnosisNotes: { type: String, maxlength: 2000 },
    medicines: [prescriptionMedicineSchema],
    advice: { type: String, maxlength: 1000 },
    followUpDate: { type: Date, default: null },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });

export const Prescription = model("Prescription", prescriptionSchema);
