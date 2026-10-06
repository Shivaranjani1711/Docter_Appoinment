import { useRef, useState } from "react";
import { useMyReports, useUploadReport } from "../../api/hooks";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { Alert } from "../../components/Alert";
import { ApiError, apiFetchBlob } from "../../api/client";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PatientReports() {
  const { data, isLoading } = useMyReports();
  const upload = useUploadReport();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      await upload.mutateAsync(file);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not upload this file. Only PDF, JPG and PNG files up to 10MB are supported."
      );
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleOpen(id: string) {
    setError(null);
    try {
      const { blob } = await apiFetchBlob(`/medical-reports/${id}/file`);
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not open this report.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink-900">Medical reports</h1>
        <label className="btn-primary cursor-pointer">
          {upload.isPending ? "Uploading..." : "Upload Medical Report"}
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleUpload}
            disabled={upload.isPending}
          />
        </label>
      </div>
      <p className="mt-1 text-sm text-ink-500">PDF, JPG or PNG, up to 10MB. Only you and doctors you consult can view these.</p>

      {error && <Alert kind="error">{error}</Alert>}

      <div className="mt-6">
        {isLoading && <LoadingState />}
        {!isLoading && data?.reports.length === 0 && (
          <EmptyState title="No medical reports uploaded" description="Upload a report before your next appointment." />
        )}
        <div className="space-y-2">
          {data?.reports.map((report) => (
            <button
              key={report._id}
              type="button"
              onClick={() => handleOpen(report._id)}
              className="card flex w-full items-center justify-between text-left hover:border-brand-300"
            >
              <div>
                <p className="font-medium text-ink-900">{report.originalFileName}</p>
                <p className="text-sm text-ink-500">
                  {formatSize(report.sizeBytes)} &middot; {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
