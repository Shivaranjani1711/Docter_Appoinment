import { Link } from "react-router-dom";
import { useMyAppointments } from "../../api/hooks";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../auth/AuthContext";

function isToday(dateStr: string) {
  return dateStr.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

export function DoctorDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useMyAppointments();

  const today = (data?.appointments ?? []).filter((a) => {
    const slot = typeof a.slotId === "object" ? a.slotId : null;
    return slot && isToday(slot.date) && ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(a.status);
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Welcome, Dr. {user?.fullName}</h1>
      <h2 className="mt-6 text-lg font-semibold text-ink-900">Today's appointments</h2>

      {isLoading && <LoadingState />}
      {!isLoading && today.length === 0 && <EmptyState title="No appointments scheduled for today" />}
      <div className="mt-3 space-y-3">
        {today.map((appointment) => {
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
                  {slot?.startTime} &middot; {appointment.type === "ONLINE" ? "Online" : "In-person"}
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
