import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import { LoadingState } from "../../components/LoadingState";

interface Overview {
  totalPatients: number;
  totalDoctors: number;
  approvedDoctors: number;
  totalAppointments: number;
  onlineAppointments: number;
  inPersonAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  conversionToVideoCount: number;
  appointmentConversionRate: number | null;
  emergencyRequestsTotal: number;
  emergencyRequestsCompleted: number;
  totalRevenuePaise: number;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink-900">{value}</p>
    </div>
  );
}

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => apiFetch<Overview>("/admin/analytics/overview"),
  });

  if (isLoading || !data) return <LoadingState />;

  const hasAnyData = data.totalAppointments > 0 || data.totalPatients > 0 || data.totalDoctors > 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Overview</h1>
      {!hasAnyData && (
        <p className="mt-2 text-sm text-ink-500">No data available yet - figures will populate as patients, doctors and appointments are added.</p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Total patients" value={data.totalPatients} />
        <Stat label="Total doctors" value={data.totalDoctors} />
        <Stat label="Approved doctors" value={data.approvedDoctors} />
        <Stat label="Total appointments" value={data.totalAppointments} />
        <Stat label="Online appointments" value={data.onlineAppointments} />
        <Stat label="In-person appointments" value={data.inPersonAppointments} />
        <Stat label="Completed" value={data.completedAppointments} />
        <Stat label="Cancelled" value={data.cancelledAppointments} />
        <Stat label="No-shows" value={data.noShowAppointments} />
        <Stat
          label="Conversion to video rate"
          value={data.appointmentConversionRate !== null ? `${(data.appointmentConversionRate * 100).toFixed(1)}%` : "No data available"}
        />
        <Stat label="Emergency requests" value={data.emergencyRequestsTotal} />
        <Stat label="Emergency completed" value={data.emergencyRequestsCompleted} />
        <Stat label="Revenue (captured)" value={`₹${(data.totalRevenuePaise / 100).toFixed(2)}`} />
      </div>
    </div>
  );
}
