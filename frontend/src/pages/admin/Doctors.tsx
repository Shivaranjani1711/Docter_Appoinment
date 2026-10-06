import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";

interface AdminDoctorRow {
  _id: string;
  userId: { fullName: string; email: string };
  specializationId: { name: string } | null;
  consultationFee: number;
  isApproved: boolean;
}

export function AdminDoctors() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-doctors"],
    queryFn: () => apiFetch<{ doctors: AdminDoctorRow[] }>("/admin/doctors"),
  });

  const setApproval = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      apiFetch(`/admin/doctors/${id}/approval`, { method: "POST", body: { isApproved } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-doctors"] }),
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Doctors</h1>
      {isLoading && <LoadingState />}
      {!isLoading && data?.doctors.length === 0 && <EmptyState title="No doctors registered yet" />}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-ink-500">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Specialization</th>
              <th className="py-2 pr-4">Fee</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.doctors.map((d) => (
              <tr key={d._id} className="border-b border-ink-50">
                <td className="py-2 pr-4">{d.userId?.fullName}</td>
                <td className="py-2 pr-4">{d.userId?.email}</td>
                <td className="py-2 pr-4">{d.specializationId?.name ?? "-"}</td>
                <td className="py-2 pr-4">{d.consultationFee > 0 ? `₹${d.consultationFee}` : "Free"}</td>
                <td className="py-2 pr-4">
                  <span className={`badge ${d.isApproved ? "bg-success-50 text-success-600" : "bg-warning-50 text-warning-600"}`}>
                    {d.isApproved ? "Approved" : "Pending approval"}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <button
                    className={d.isApproved ? "btn-danger" : "btn-primary"}
                    onClick={() => setApproval.mutate({ id: d._id, isApproved: !d.isApproved })}
                  >
                    {d.isApproved ? "Suspend" : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
