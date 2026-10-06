import fs from "fs/promises";
import path from "path";
import type { StorageAdapter } from "./StorageAdapter";

// Dev/demo storage only: writes outside the web root, never served by a static
// middleware, and reachable only through the authenticated download endpoint.
// Swap for s3Adapter.ts (same interface) when real cloud credentials are available.
const ROOT = path.resolve(__dirname, "../../../uploads");

export class LocalDiskStorageAdapter implements StorageAdapter {
  private resolveSafePath(key: string): string {
    const resolved = path.resolve(ROOT, key);
    if (!resolved.startsWith(ROOT)) {
      // Defense against path traversal via a malformed storage key.
      throw new Error("Invalid storage key");
    }
    return resolved;
  }

  async save(key: string, buffer: Buffer): Promise<void> {
    const filePath = this.resolveSafePath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(this.resolveSafePath(key));
  }

  async delete(key: string): Promise<void> {
    await fs.rm(this.resolveSafePath(key), { force: true });
  }
}
