import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useAppointment,
  useCancelAppointment,
  useConvertToVideo,
  useDoctorSlots,
  useRescheduleAppointment,
} from "../../api/hooks";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { Alert } from "../../components/Alert";
import { ApiError, apiFetch } from "../../api/client";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function PatientAppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, refetch } = useAppointment(id);
  const cancelMutation = useCancelAppointment();
  const convertMutation = useConvertToVideo();
  const rescheduleMutation = useRescheduleAppointment();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(todayIso());
  const [showReschedule, setShowReschedule] = useState(false);
  const [joinInfo, setJoinInfo] = useState<{ roomUrl: string } | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const appointment = data?.appointment;
  const slot = appointment && typeof appointment.slotId === "object" ? appointment.slotId : null;
  const { data: newSlots } = useDoctorSlots(appointment?.doctorId, showReschedule ? rescheduleDate : undefined);

  if (isLoading) return <LoadingState />;
  if (!appointment) return <EmptyState title="Appointment not found" />;

  const canCancel = ["PENDING", "CONFIRMED"].includes(appointment.status);
  const canReschedule = ["PENDING", "CONFIRMED"].includes(appointment.status);
  const canConvert = appointment.type === "IN_PERSON" && ["PENDING", "CONFIRMED"].includes(appointment.status);
  const canJoin = appointment.type === "ONLINE" && ["CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(appointment.status);

  async function handleCancel() {
    setActionError(null);
    try {
      await cancelMutation.mutateAsync({ id: appointment!._id, reason: "Cancelled by patient" });
      setActionNotice("Appointment cancelled.");
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not cancel this appointment.");
    }
  }

  async function handleConvert() {
    setActionError(null);
    try {
      await convertMutation.mutateAsync({ id: appointment!._id });
      setActionNotice("Appointment converted to a video consultation.");
      refetch();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not convert this appointment.");
    }
  }

  async function handleReschedule(newSlotId: string) {
    setActionError(null);
    try {
      const result = await rescheduleMutation.mutateAsync({ id: appointment!._id, newSlotId });
      setActionNotice("Appointment rescheduled.");
      setShowReschedule(false);
      window.location.href = `/patient/appointments/${result.appointment._id}`;
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not reschedule this appointment.");
    }
  }

  async function handleJoin() {
    setJoinError(null);
    try {
      const result = await apiFetch<{ roomUrl: string; token: string }>(
        `/video-consultations/${appointment!._id}/join`,
        { method: "POST" }
      );
      setJoinInfo(result);
    } catch (err) {
      setJoinError(err instanceof ApiError ? err.message : "Could not join the consultation.");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink-900">Appointment details</h1>
        <StatusBadge status={appointment.status} />
      </div>

      {actionNotice && <Alert kind="success">{actionNotice}</Alert>}
      {actionError && <Alert kind="error">{actionError}</Alert>}

      <div className="card mt-4 space-y-2 text-sm">
        <p>
          <span className="font-medium text-ink-900">Type:</span>{" "}
          {appointment.type === "ONLINE" ? "Online consultation" : "In-person consultation"}
        </p>
        {slot && (
          <p>
            <span className="font-medium text-ink-900">When:</span> {slot.date.slice(0, 10)} at {slot.startTime}
          </p>
        )}
        <p>
          <span className="font-medium text-ink-900">Problem:</span> {appointment.problemSummary}
        </p>
        {appointment.symptoms.length > 0 && (
          <p>
            <span className="font-medium text-ink-900">Symptoms:</span> {appointment.symptoms.join(", ")}
          </p>
        )}
        {appointment.consultationNotes && (
          <p>
            <span className="font-medium text-ink-900">Doctor's notes:</span> {appointment.consultationNotes}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {canJoin && (
          <button className="btn-primary" onClick={handleJoin}>
            Join video consultation
          </button>
        )}
        {canConvert && (
          <button className="btn-secondary" onClick={handleConvert} disabled={convertMutation.isPending}>
            Convert to video consultation
          </button>
        )}
        {canReschedule && (
          <button className="btn-secondary" onClick={() => setShowReschedule((v) => !v)}>
            Reschedule
          </button>
        )}
        {canCancel && (
          <button className="btn-danger" onClick={handleCancel} disabled={cancelMutation.isPending}>
            Cancel appointment
          </button>
        )}
      </div>

      {joinError && <Alert kind="error">{joinError}</Alert>}
      {joinInfo && (
        <div className="card mt-4">
          <p className="text-sm text-ink-700">Your consultation room is ready.</p>
          <a href={joinInfo.roomUrl} target="_blank" rel="noreferrer" className="btn-primary mt-2 inline-flex">
            Open video consultation
          </a>
        </div>
      )}

      {showReschedule && (
        <div className="card mt-4">
          <label className="label" htmlFor="rescheduleDate">
            New date
          </label>
          <input
            id="rescheduleDate"
            type="date"
            className="input max-w-xs"
            min={todayIso()}
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {newSlots?.slots
              .filter((s) => s.status === "OPEN")
              .map((s) => (
                <button key={s._id} className="rounded-sm border border-ink-200 px-3 py-1.5 text-sm hover:border-brand-400" onClick={() => handleReschedule(s._id)}>
                  {s.type === "ONLINE" ? "Online" : "In-person"} {s.startTime}
                </button>
              ))}
            {newSlots?.slots.filter((s) => s.status === "OPEN").length === 0 && (
              <p className="text-sm text-ink-500">No open slots on this date.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
