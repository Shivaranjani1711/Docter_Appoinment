import { useState } from "react";
import { Link } from "react-router-dom";
import { useDoctors } from "../../api/hooks";
import { useAuth } from "../../auth/AuthContext";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";

export function DoctorSearch() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useDoctors({ search: search || undefined });

  const basePath = user?.role === "PATIENT" ? "/patient/doctors" : "/doctors";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-ink-900">Find a doctor</h1>
      <input
        className="input mt-4 max-w-sm"
        placeholder="Search by doctor name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search doctors by name"
      />

      <div className="mt-6">
        {isLoading && <LoadingState label="Loading doctors..." />}
        {!isLoading && data?.doctors.length === 0 && (
          <EmptyState title="No doctors found" description="Try a different search term." />
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.doctors.map((doctor) => (
            <Link key={doctor._id} to={`${basePath}/${doctor._id}`} className="card hover:border-brand-300">
              <p className="font-medium text-ink-900">{doctor.userId?.fullName ?? "Doctor"}</p>
              <p className="text-sm text-ink-600">{doctor.specializationId?.name}</p>
              <p className="mt-2 text-sm text-ink-500">
                {doctor.experienceYears} year{doctor.experienceYears === 1 ? "" : "s"} experience
              </p>
              <div className="mt-3 flex gap-2 text-xs">
                {doctor.supportsOnline && <span className="badge bg-brand-50 text-brand-700">Online</span>}
                {doctor.supportsInPerson && <span className="badge bg-ink-100 text-ink-600">In-person</span>}
              </div>
              <p className="mt-2 text-sm text-ink-700">
                {doctor.consultationFee > 0 ? `Fee: ₹${doctor.consultationFee}` : "No consultation fee"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
