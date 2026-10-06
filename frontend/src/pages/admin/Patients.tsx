import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";

interface PatientRow {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export function AdminPatients() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-patients"],
    queryFn: () => apiFetch<{ patients: PatientRow[] }>("/admin/patients"),
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Patients</h1>
      {isLoading && <LoadingState />}
      {!isLoading && data?.patients.length === 0 && <EmptyState title="No patients registered yet" />}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-ink-500">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Joined</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.patients.map((p) => (
              <tr key={p._id} className="border-b border-ink-50">
                <td className="py-2 pr-4">{p.fullName}</td>
                <td className="py-2 pr-4">{p.email}</td>
                <td className="py-2 pr-4">{p.phone ?? "-"}</td>
                <td className="py-2 pr-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="py-2 pr-4">
                  <span className={`badge ${p.isActive ? "bg-success-50 text-success-600" : "bg-ink-100 text-ink-600"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
