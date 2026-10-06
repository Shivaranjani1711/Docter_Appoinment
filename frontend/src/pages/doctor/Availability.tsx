import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../../api/client";
import { Alert } from "../../components/Alert";
import { LoadingState } from "../../components/LoadingState";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Template {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMin: number;
  onlineRatio: number;
  isActive: boolean;
}

interface Leave {
  _id: string;
  date: string;
  reason?: string;
}

export function DoctorAvailability() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-availability"],
    queryFn: () => apiFetch<{ templates: Template[]; leave: Leave[] }>("/doctors/me/availability"),
  });

  const [form, setForm] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    slotDurationMin: 30,
    breakStart: "13:00",
    breakEnd: "14:00",
    onlineRatio: 0.5,
    isActive: true,
  });
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const saveTemplate = useMutation({
    mutationFn: () => apiFetch("/doctors/me/availability", { method: "PUT", body: form }),
    onSuccess: () => {
      setNotice("Availability saved for this day.");
      qc.invalidateQueries({ queryKey: ["my-availability"] });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not save availability."),
  });

  const addLeave = useMutation({
    mutationFn: () => apiFetch("/doctors/me/leave", { method: "POST", body: { date: leaveDate, reason: leaveReason } }),
    onSuccess: (result: any) => {
      setNotice(result.notice ?? "Leave added.");
      setLeaveDate("");
      setLeaveReason("");
      qc.invalidateQueries({ queryKey: ["my-availability"] });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not add leave."),
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-ink-900">Availability</h1>
      {notice && <Alert kind="success">{notice}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      <div className="card mt-4">
        <h2 className="font-medium text-ink-900">Set working hours for a day</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className="label">Day</label>
            <select
              className="input"
              value={form.dayOfWeek}
              onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}
            >
              {DAYS.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Start time</label>
            <input type="time" className="input" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
          </div>
          <div>
            <label className="label">End time</label>
            <input type="time" className="input" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
          </div>
          <div>
            <label className="label">Break start</label>
            <input type="time" className="input" value={form.breakStart} onChange={(e) => setForm((f) => ({ ...f, breakStart: e.target.value }))} />
          </div>
          <div>
            <label className="label">Break end</label>
            <input type="time" className="input" value={form.breakEnd} onChange={(e) => setForm((f) => ({ ...f, breakEnd: e.target.value }))} />
          </div>
          <div>
            <label className="label">Slot duration (minutes)</label>
            <input
              type="number"
              min={5}
              className="input"
              value={form.slotDurationMin}
              onChange={(e) => setForm((f) => ({ ...f, slotDurationMin: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="label">Online share (0-1)</label>
            <input
              type="number"
              step={0.1}
              min={0}
              max={1}
              className="input"
              value={form.onlineRatio}
              onChange={(e) => setForm((f) => ({ ...f, onlineRatio: Number(e.target.value) }))}
            />
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={() => saveTemplate.mutate()} disabled={saveTemplate.isPending}>
          Save Availability
        </button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <div className="mt-4">
          <h2 className="font-medium text-ink-900">Current weekly schedule</h2>
          <div className="mt-2 space-y-1 text-sm">
            {data?.templates.map((t) => (
              <p key={t._id}>
                {DAYS[t.dayOfWeek]}: {t.startTime}-{t.endTime}, {t.slotDurationMin}min slots,{" "}
                {Math.round(t.onlineRatio * 100)}% online {t.isActive ? "" : "(inactive)"}
              </p>
            ))}
            {data?.templates.length === 0 && <p className="text-ink-500">No availability configured yet.</p>}
          </div>
        </div>
      )}

      <div className="card mt-6">
        <h2 className="font-medium text-ink-900">Mark a day as unavailable (leave)</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="label">Reason (optional)</label>
            <input className="input" value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} />
          </div>
          <button className="btn-secondary" onClick={() => addLeave.mutate()} disabled={!leaveDate || addLeave.isPending}>
            Add Leave
          </button>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          {data?.leave.map((l) => (
            <p key={l._id}>
              {l.date.slice(0, 10)} {l.reason ? `- ${l.reason}` : ""}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
