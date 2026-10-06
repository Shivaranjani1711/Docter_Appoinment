import { Link } from "react-router-dom";
import { useMyAppointments } from "../../api/hooks";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../auth/AuthContext";

export function PatientDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useMyAppointments();
  const upcoming = data?.appointments.filter((a) => ["PENDING", "CONFIRMED", "RESCHEDULED"].includes(a.status)) ?? [];

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Welcome, {user?.fullName}</h1>

      <div className="mt-6 flex gap-3">
        <Link to="/patient/doctors" className="btn-primary">
          Book Appointment
        </Link>
        <Link to="/patient/emergency" className="btn-secondary">
          Emergency Consultation
        </Link>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-ink-900">Upcoming appointments</h2>
      {isLoading && <LoadingState />}
      {!isLoading && upcoming.length === 0 && (
        <EmptyState title="No upcoming appointments" description="Book an appointment with a doctor to get started." />
      )}
      <div className="mt-3 space-y-3">
        {upcoming.map((appointment) => {
          const slot = typeof appointment.slotId === "object" ? appointment.slotId : null;
          return (
            <Link key={appointment._id} to={`/patient/appointments/${appointment._id}`} className="card flex items-center justify-between hover:border-brand-300">
              <div>
                <p className="font-medium text-ink-900">
                  {appointment.type === "ONLINE" ? "Online consultation" : "In-person consultation"}
                </p>
                {slot && (
                  <p className="text-sm text-ink-600">
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
