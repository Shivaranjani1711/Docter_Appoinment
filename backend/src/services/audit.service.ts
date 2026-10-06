import { Types } from "mongoose";
import { AuditLog } from "../models/AuditLog";

interface RecordAuditInput {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  ip?: string;
  metadata?: Record<string, unknown>;
}

export async function recordAudit(input: RecordAuditInput): Promise<void> {
  await AuditLog.create({
    actorId: input.actorId ? new Types.ObjectId(input.actorId) : null,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ? new Types.ObjectId(input.targetId) : null,
    ip: input.ip,
    metadata: input.metadata,
  });
}
