import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyAppointments } from "../../api/hooks";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Upcoming", value: "CONFIRMED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function DoctorAppointments() {
  const [status, setStatus] = useState("");
  const { data, isLoading } = useMyAppointments(status || undefined);

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Appointments</h1>
      <div className="mt-3 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-sm px-3 py-1.5 text-sm ${status === f.value ? "bg-brand-600 text-white" : "border border-ink-200 text-ink-700"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingState />}
      {!isLoading && data?.appointments.length === 0 && <EmptyState title="No appointments found" />}
      <div className="mt-4 space-y-3">
        {data?.appointments.map((appointment) => {
          const slot = typeof appointment.slotId === "object" ? appointment.slotId : null;
          const patientName = typeof appointment.patientId === "object" ? appointment.patientId.fullName : "Patient";
          return (
            <Link
              key={appointment._id}
              to={`/doctor/appointments/${appointment._id}`}
              className="card flex items-center justify-between hover:border-brand-300"
            >
              <div>
                <p className="font-medium text-ink-900">{patientName}</p>
                <p className="text-sm text-ink-600">
                  {slot?.date.slice(0, 10)} {slot?.startTime} &middot; {appointment.type === "ONLINE" ? "Online" : "In-person"}
                </p>
              </div>
              <StatusBadge status={appointment.status} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
