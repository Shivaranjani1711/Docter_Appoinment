import { LocalDiskStorageAdapter } from "./localDiskAdapter";
import type { StorageAdapter } from "./StorageAdapter";

// STORAGE_DRIVER=s3 would select an S3-compatible adapter implementing the same
// StorageAdapter interface (see .env.example for the S3_* variables reserved for it).
// Local disk is the default so the project runs without any cloud account.
export const storage: StorageAdapter = new LocalDiskStorageAdapter();
