import crypto from "crypto";
import { fromBuffer as fileTypeFromBuffer } from "file-type";
import { MedicalReport, MEDICAL_REPORT_MIME_TYPES } from "../models/MedicalReport";
import { storage } from "./storage";
import { ApiError } from "../utils/ApiError";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png"]);

export async function uploadMedicalReport(input: {
  patientId: string;
  appointmentId?: string;
  originalFileName: string;
  buffer: Buffer;
  declaredMimeType: string;
  label?: string;
}) {
  if (input.buffer.length > MAX_SIZE_BYTES) {
    throw new ApiError(413, "FILE_TOO_LARGE", "File exceeds the 10MB limit");
  }
  if (input.buffer.length === 0) {
    throw new ApiError(422, "EMPTY_FILE", "The uploaded file is empty");
  }

  // Never trust the client-declared MIME type or file extension alone - sniff the
  // actual file content (magic bytes) and reject anything that doesn't match.
  const sniffed = await fileTypeFromBuffer(input.buffer);
  const isPdfByHeader = input.buffer.subarray(0, 5).toString("ascii") === "%PDF-";

  const effectiveExt = sniffed?.ext ?? (isPdfByHeader ? "pdf" : undefined);
  const effectiveMime = sniffed?.mime ?? (isPdfByHeader ? "application/pdf" : undefined);

  if (!effectiveExt || !ALLOWED_EXTENSIONS.has(effectiveExt) || !effectiveMime) {
    throw new ApiError(
      422,
      "UNSUPPORTED_FILE_TYPE",
      "Only PDF, JPG and PNG files are supported"
    );
  }
  if (!MEDICAL_REPORT_MIME_TYPES.includes(effectiveMime as (typeof MEDICAL_REPORT_MIME_TYPES)[number])) {
    throw new ApiError(422, "UNSUPPORTED_FILE_TYPE", "Only PDF, JPG and PNG files are supported");
  }

  const storageKey = `medical-reports/${input.patientId}/${crypto.randomUUID()}.${effectiveExt}`;
  await storage.save(storageKey, input.buffer);

  return MedicalReport.create({
    patientId: input.patientId,
    appointmentId: input.appointmentId ?? null,
    originalFileName: input.originalFileName.slice(0, 200),
    storageKey,
    mimeType: effectiveMime,
    sizeBytes: input.buffer.length,
    label: input.label,
  });
}

export async function getMedicalReportFile(reportId: string) {
  const report = await MedicalReport.findById(reportId);
  if (!report) return null;
  const buffer = await storage.read(report.storageKey);
  return { report, buffer };
}
