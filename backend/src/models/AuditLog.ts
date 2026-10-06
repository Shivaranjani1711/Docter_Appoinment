import { Schema, model, Types } from "mongoose";

// Audit entries must never contain medical payloads (symptoms, diagnoses, file contents) -
// only the fact that an action occurred, by whom, and against which record id.
const auditLogSchema = new Schema(
  {
    actorId: { type: Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: Types.ObjectId, default: null },
    ip: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

export const AuditLog = model("AuditLog", auditLogSchema);
