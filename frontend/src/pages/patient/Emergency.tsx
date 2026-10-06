import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../../api/client";
import { Alert } from "../../components/Alert";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";

interface EmergencyRequest {
  _id: string;
  problemSummary: string;
  status: string;
  createdAt: string;
}

export function PatientEmergency() {
  const [problemSummary, setProblemSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["emergency-requests"],
    queryFn: () => apiFetch<{ requests: EmergencyRequest[] }>("/emergency-requests"),
    refetchInterval: 5000,
  });

  const create = useMutation({
    mutationFn: () => apiFetch("/emergency-requests", { method: "POST", body: { problemSummary } }),
    onSuccess: () => {
      setProblemSummary("");
      qc.invalidateQueries({ queryKey: ["emergency-requests"] });
    },
  });

  const cancel = useMutation({
    mutationFn: (id: string) => apiFetch(`/emergency-requests/${id}/cancel`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emergency-requests"] }),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit your request.");
    }
  }

  const activeRequest = data?.requests.find((r) => ["WAITING", "ACCEPTED", "IN_PROGRESS"].includes(r.status));

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-ink-900">Emergency consultation</h1>
      <Alert kind="warning">
        <strong>Not an emergency medical service.</strong> If this is a life-threatening emergency, contact
        your local emergency number or go to the nearest emergency facility immediately. This feature
        connects you with an available doctor on a best-effort basis only.
      </Alert>

      {error && <Alert kind="error">{error}</Alert>}

      {activeRequest ? (
        <div className="card mt-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-ink-900">Your request</p>
            <StatusBadge status={activeRequest.status} />
          </div>
          <p className="mt-2 text-sm text-ink-700">{activeRequest.problemSummary}</p>
          {activeRequest.status === "WAITING" && (
            <button className="btn-danger mt-3" onClick={() => cancel.mutate(activeRequest._id)}>
              Cancel request
            </button>
          )}
          {activeRequest.status === "ACCEPTED" || activeRequest.status === "IN_PROGRESS" ? (
            <p className="mt-2 text-sm text-success-600">A doctor has accepted your request.</p>
          ) : null}
        </div>
      ) : (
        <form className="card mt-4 space-y-3" onSubmit={onSubmit}>
          <label className="label" htmlFor="problemSummary">
            Briefly describe what's wrong
          </label>
          <textarea
            id="problemSummary"
            required
            minLength={5}
            className="input"
            rows={3}
            value={problemSummary}
            onChange={(e) => setProblemSummary(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={create.isPending}>
            {create.isPending ? "Requesting..." : "Request Emergency Consultation"}
          </button>
        </form>
      )}

      <h2 className="mt-8 text-lg font-semibold text-ink-900">Past requests</h2>
      {isLoading && <LoadingState />}
      {!isLoading && data?.requests.length === 0 && <EmptyState title="No emergency requests yet" />}
      <div className="mt-3 space-y-2">
        {data?.requests
          .filter((r) => r._id !== activeRequest?._id)
          .map((r) => (
            <div key={r._id} className="card flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-900">{r.problemSummary}</p>
                <p className="text-xs text-ink-500">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
      </div>
    </div>
  );
}
