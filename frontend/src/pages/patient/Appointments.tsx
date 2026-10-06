import { Link } from "react-router-dom";
import { useMyAppointments } from "../../api/hooks";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";

export function PatientAppointments() {
  const { data, isLoading } = useMyAppointments();
  const appointments = [...(data?.appointments ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Your appointments</h1>
      {isLoading && <LoadingState />}
      {!isLoading && appointments.length === 0 && (
        <EmptyState title="No appointments yet" description="Book your first appointment with a doctor." />
      )}
      <div className="mt-4 space-y-3">
        {appointments.map((appointment) => {
          const slot = typeof appointment.slotId === "object" ? appointment.slotId : null;
          return (
            <Link
              key={appointment._id}
              to={`/patient/appointments/${appointment._id}`}
              className="card flex items-center justify-between hover:border-brand-300"
            >
              <div>
                <p className="font-medium text-ink-900">
                  {appointment.type === "ONLINE" ? "Online consultation" : "In-person consultation"}
                </p>
                <p className="text-sm text-ink-600">{appointment.problemSummary}</p>
                {slot && (
                  <p className="mt-1 text-xs text-ink-500">
                    {slot.date.slice(0, 10)} at {slot.startTime}
                  </p>
                )}
              </div>
              <StatusBadge status={appointment.status} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
