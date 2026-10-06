import { Schema, model, Types } from "mongoose";

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

export const Department = model("Department", departmentSchema);

const specializationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    departmentId: { type: Types.ObjectId, ref: "Department", required: true },
  },
  { timestamps: true }
);
specializationSchema.index({ departmentId: 1, name: 1 }, { unique: true });

export const Specialization = model("Specialization", specializationSchema);
