import { Schema, model } from "mongoose";

// Single-hospital deployment: this collection is expected to hold exactly one document.
const hospitalSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    registrationPlaceholder: { type: String, default: "CONFIGURE_REAL_REGISTRATION_NUMBER" },
  },
  { timestamps: true }
);

export const Hospital = model("Hospital", hospitalSchema);
