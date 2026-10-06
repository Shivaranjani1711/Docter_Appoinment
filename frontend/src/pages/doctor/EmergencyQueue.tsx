import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../../api/client";
import { Alert } from "../../components/Alert";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { useState } from "react";

interface EmergencyRequest {
  _id: string;
  problemSummary: string;
  status: string;
  createdAt: string;
}

export function DoctorEmergencyQueue() {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["open-emergency-requests"],
    queryFn: () => apiFetch<{ requests: EmergencyRequest[] }>("/emergency-requests/open"),
    refetchInterval: 5000,
  });

  const accept = useMutation({
    mutationFn: (id: string) => apiFetch<{ roomUrl?: string }>(`/emergency-requests/${id}/accept`, { method: "POST" }),
    onSuccess: (result) => {
      setRoomUrl(result.roomUrl ?? null);
      qc.invalidateQueries({ queryKey: ["open-emergency-requests"] });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not accept this request."),
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-ink-900">Emergency queue</h1>
      <p className="mt-1 text-sm text-ink-500">
        Patients requesting emergency teleconsultation matching your specialization (or open to any doctor).
      </p>

      {error && <Alert kind="error">{error}</Alert>}
      {roomUrl && (
        <div className="card mt-4">
          <p className="text-sm text-ink-700">You accepted a request. Join the consultation:</p>
          <a href={roomUrl} target="_blank" rel="noreferrer" className="btn-primary mt-2 inline-flex">
            Join video consultation
          </a>
        </div>
      )}

      {isLoading && <LoadingState />}
      {!isLoading && data?.requests.length === 0 && <EmptyState title="No open emergency requests right now" />}
      <div className="mt-4 space-y-3">
        {data?.requests.map((r) => (
          <div key={r._id} className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-900">{r.problemSummary}</p>
              <p className="text-xs text-ink-500">{new Date(r.createdAt).toLocaleString()}</p>
            </div>
            <button className="btn-primary" onClick={() => accept.mutate(r._id)} disabled={accept.isPending}>
              Accept
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
