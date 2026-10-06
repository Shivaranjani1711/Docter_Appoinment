import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../../api/client";
import { Alert } from "../../components/Alert";
import { LoadingState } from "../../components/LoadingState";

interface Department {
  _id: string;
  name: string;
}
interface Specialization {
  _id: string;
  name: string;
  departmentId: { _id: string; name: string } | string;
}

export function AdminDepartments() {
  const qc = useQueryClient();
  const [departmentName, setDepartmentName] = useState("");
  const [specName, setSpecName] = useState("");
  const [specDepartmentId, setSpecDepartmentId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: departments, isLoading: loadingDepts } = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiFetch<{ departments: Department[] }>("/departments"),
  });
  const { data: specs, isLoading: loadingSpecs } = useQuery({
    queryKey: ["specializations"],
    queryFn: () => apiFetch<{ specializations: Specialization[] }>("/specializations"),
  });

  const createDepartment = useMutation({
    mutationFn: () => apiFetch("/admin/departments", { method: "POST", body: { name: departmentName } }),
    onSuccess: () => {
      setDepartmentName("");
      qc.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create department."),
  });

  const createSpecialization = useMutation({
    mutationFn: () =>
      apiFetch("/admin/specializations", { method: "POST", body: { name: specName, departmentId: specDepartmentId } }),
    onSuccess: () => {
      setSpecName("");
      qc.invalidateQueries({ queryKey: ["specializations"] });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create specialization."),
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-ink-900">Departments & specializations</h1>
      {error && <Alert kind="error">{error}</Alert>}

      <div className="card mt-4">
        <h2 className="font-medium text-ink-900">Add department</h2>
        <div className="mt-2 flex gap-2">
          <input className="input" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder="e.g. Cardiology" />
          <button className="btn-primary" onClick={() => createDepartment.mutate()} disabled={!departmentName || createDepartment.isPending}>
            Add
          </button>
        </div>
        {loadingDepts ? (
          <LoadingState />
        ) : (
          <ul className="mt-3 text-sm text-ink-700">
            {departments?.departments.map((d) => (
              <li key={d._id}>{d.name}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="card mt-4">
        <h2 className="font-medium text-ink-900">Add specialization</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <select className="input max-w-xs" value={specDepartmentId} onChange={(e) => setSpecDepartmentId(e.target.value)}>
            <option value="">Select department</option>
            {departments?.departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
          <input className="input max-w-xs" value={specName} onChange={(e) => setSpecName(e.target.value)} placeholder="e.g. Pediatric Cardiology" />
          <button
            className="btn-primary"
            onClick={() => createSpecialization.mutate()}
            disabled={!specName || !specDepartmentId || createSpecialization.isPending}
          >
            Add
          </button>
        </div>
        {loadingSpecs ? (
          <LoadingState />
        ) : (
          <ul className="mt-3 text-sm text-ink-700">
            {specs?.specializations.map((s) => (
              <li key={s._id}>{s.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
