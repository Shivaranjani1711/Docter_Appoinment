import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAppointment } from "../../api/hooks";
import { apiFetch, apiFetchBlob, ApiError } from "../../api/client";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { Alert } from "../../components/Alert";
import type { MedicalReportSummary } from "../../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface MedicineRow {
  name: string;
  dosage: string;
  frequency: string;
  durationDays?: number;
  instructions?: string;
}

export function DoctorAppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, refetch } = useAppointment(id);
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [advice, setAdvice] = useState("");
  const [medicines, setMedicines] = useState<MedicineRow[]>([{ name: "", dosage: "", frequency: "" }]);

  const appointment = data?.appointment;
  const slot = appointment && typeof appointment.slotId === "object" ? appointment.slotId : null;
  const patientId = appointment && typeof appointment.patientId === "object" ? appointment.patientId._id : undefined;

  const { data: reportsData } = useQuery({
    queryKey: ["patient-reports", patientId],
    queryFn: () => apiFetch<{ reports: MedicalReportSummary[] }>(`/medical-reports/patient/${patientId}`),
    enabled: Boolean(patientId),
  });

  if (isLoading) return <LoadingState />;
  if (!appointment) return <EmptyState title="Appointment not found" />;

  const patientName = typeof appointment.patientId === "object" ? appointment.patientId.fullName : "Patient";

  async function runAction(action: "check-in" | "start" | "complete") {
    setError(null);
    try {
      await apiFetch(`/appointments/${appointment!._id}/${action}`, {
        method: "POST",
        body: action === "complete" ? { consultationNotes: notes } : undefined,
      });
      setNotice("Updated.");
      refetch();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update this appointment.");
    }
  }

  async function handleJoin() {
    setError(null);
    try {
      const result = await apiFetch<{ roomUrl: string }>(`/video-consultations/${appointment!._id}/join`, {
        method: "POST",
      });
      window.open(result.roomUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not join the consultation.");
    }
  }

  async function handleCreatePrescription() {
    setError(null);
    try {
      await apiFetch("/prescriptions", {
        method: "POST",
        body: {
          appointmentId: appointment!._id,
          diagnosisNotes,
          advice,
          medicines: medicines.filter((m) => m.name && m.dosage && m.frequency),
        },
      });
      setNotice("Prescription created.");
      qc.invalidateQueries({ queryKey: ["prescriptions"] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the prescription.");
    }
  }

  async function handleOpenReport(reportId: string) {
    try {
      const { blob } = await apiFetchBlob(`/medical-reports/${reportId}/file`);
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not open this report.");
    }
  }

  function updateMedicine(i: number, field: keyof MedicineRow, value: string) {
    setMedicines((rows) =>
      rows.map((row, idx) => (idx === i ? { ...row, [field]: field === "durationDays" ? Number(value) : value } : row))
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink-900">{patientName}</h1>
        <StatusBadge status={appointment.status} />
      </div>

      {notice && <Alert kind="success">{notice}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      <div className="card mt-4 space-y-1 text-sm">
        {slot && (
          <p>
            <span className="font-medium text-ink-900">When:</span> {slot.date.slice(0, 10)} at {slot.startTime}
          </p>
        )}
        <p>
          <span className="font-medium text-ink-900">Type:</span> {appointment.type === "ONLINE" ? "Online" : "In-person"}
        </p>
        <p>
          <span className="font-medium text-ink-900">Problem:</span> {appointment.problemSummary}
        </p>
        {appointment.symptoms.length > 0 && (
          <p>
            <span className="font-medium text-ink-900">Symptoms:</span> {appointment.symptoms.join(", ")}
          </p>
        )}
        {appointment.symptomDurationDays !== undefined && (
          <p>
            <span className="font-medium text-ink-900">Duration:</span> {appointment.symptomDurationDays} days
          </p>
        )}
        {appointment.additionalNotes && (
          <p>
            <span className="font-medium text-ink-900">Additional notes:</span> {appointment.additionalNotes}
          </p>
        )}
      </div>

      <div className="mt-4">
        <h2 className="font-medium text-ink-900">Patient's medical reports</h2>
        {reportsData?.reports.length ? (
          <div className="mt-2 space-y-1">
            {reportsData.reports.map((r) => (
              <button key={r._id} onClick={() => handleOpenReport(r._id)} className="block text-sm text-brand-700 hover:underline">
                {r.originalFileName}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-ink-500">No reports uploaded.</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {appointment.status === "CONFIRMED" && (
          <button className="btn-secondary" onClick={() => runAction("check-in")}>
            Check in
          </button>
        )}
        {appointment.status === "CHECKED_IN" && (
          <button className="btn-secondary" onClick={() => runAction("start")}>
            Start consultation
          </button>
        )}
        {appointment.type === "ONLINE" && ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(appointment.status) && (
          <button className="btn-primary" onClick={handleJoin}>
            Join video consultation
          </button>
        )}
      </div>

      {appointment.status === "IN_PROGRESS" && (
        <div className="card mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="notes">
              Consultation notes
            </label>
            <textarea id="notes" className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={() => runAction("complete")}>
            Complete consultation
          </button>
        </div>
      )}

      {["IN_PROGRESS", "COMPLETED"].includes(appointment.status) && (
        <div className="card mt-4 space-y-3">
          <h2 className="font-medium text-ink-900">Create prescription</h2>
          <div>
            <label className="label" htmlFor="diagnosisNotes">
              Diagnosis / clinical notes
            </label>
            <textarea id="diagnosisNotes" className="input" rows={2} value={diagnosisNotes} onChange={(e) => setDiagnosisNotes(e.target.value)} />
          </div>

          {medicines.map((m, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <input className="input" placeholder="Medicine" value={m.name} onChange={(e) => updateMedicine(i, "name", e.target.value)} />
              <input className="input" placeholder="Dosage" value={m.dosage} onChange={(e) => updateMedicine(i, "dosage", e.target.value)} />
              <input className="input" placeholder="Frequency" value={m.frequency} onChange={(e) => updateMedicine(i, "frequency", e.target.value)} />
              <input className="input" type="number" placeholder="Days" value={m.durationDays ?? ""} onChange={(e) => updateMedicine(i, "durationDays", e.target.value)} />
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={() => setMedicines((rows) => [...rows, { name: "", dosage: "", frequency: "" }])}>
            Add medicine
          </button>

          <div>
            <label className="label" htmlFor="advice">
              Advice
            </label>
            <textarea id="advice" className="input" rows={2} value={advice} onChange={(e) => setAdvice(e.target.value)} />
          </div>

          <button className="btn-primary" onClick={handleCreatePrescription}>
            Save prescription
          </button>
        </div>
      )}
    </div>
  );
}
