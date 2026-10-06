import multer from "multer";

// Buffered in memory (reports are capped at 10MB) then handed to the storage
// adapter and magic-byte validator in medicalReport.service.ts - multer's own
// fileFilter only does a cheap extension/MIME pre-check, never the final decision.
export const uploadSingleReport = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("file");
