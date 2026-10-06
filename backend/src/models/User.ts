import { Schema, model, Types, type InferSchemaType } from "mongoose";

export const USER_ROLES = ["PATIENT", "DOCTOR", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    emailVerificationTokenHash: { type: String, default: null, select: false },
    emailVerificationExpires: { type: Date, default: null, select: false },
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId };
export const User = model("User", userSchema);
