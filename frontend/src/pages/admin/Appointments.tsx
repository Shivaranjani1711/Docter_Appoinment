import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import type { Appointment } from "../../types";

const STATUS_OPTIONS = ["", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW", "EXPIRED"];

export function AdminAppointments() {
  const [status, setStatus] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-appointments", status],
    queryFn: () => apiFetch<{ appointments: Appointment[] }>(`/admin/appointments${status ? `?status=${status}` : ""}`),
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">All appointments</h1>
      <select className="input mt-3 max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s || "All statuses"}
          </option>
        ))}
      </select>

      {isLoading && <LoadingState />}
      {!isLoading && data?.appointments.length === 0 && <EmptyState title="No appointments found" />}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-ink-500">
              <th className="py-2 pr-4">Patient</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.appointments.map((a) => {
              const slot = typeof a.slotId === "object" ? a.slotId : null;
              const patientName = typeof a.patientId === "object" ? a.patientId.fullName : "-";
              return (
                <tr key={a._id} className="border-b border-ink-50">
                  <td className="py-2 pr-4">{patientName}</td>
                  <td className="py-2 pr-4">{a.type === "ONLINE" ? "Online" : "In-person"}</td>
                  <td className="py-2 pr-4">
                    {slot?.date.slice(0, 10)} {slot?.startTime}
                  </td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
