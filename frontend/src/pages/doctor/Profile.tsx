import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../../api/client";
import { Alert } from "../../components/Alert";
import { LoadingState } from "../../components/LoadingState";
import { AccountSettings } from "../../components/AccountSettings";
import { AccountDetails } from "../../components/AccountDetails";

interface Specialization {
  _id: string;
  name: string;
}

export function DoctorProfile() {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["my-doctor-profile"],
    queryFn: () => apiFetch<{ profile: any }>("/doctors/me/profile").catch(() => ({ profile: null })),
  });
  const { data: specData } = useQuery({
    queryKey: ["specializations"],
    queryFn: () => apiFetch<{ specializations: Specialization[] }>("/specializations"),
  });

  const [form, setForm] = useState({
    specializationId: "",
    qualifications: "",
    experienceYears: 0,
    consultationFee: 0,
    bio: "",
    supportsOnline: true,
    supportsInPerson: true,
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profileData?.profile) {
      const p = profileData.profile;
      setForm({
        specializationId: p.specializationId?._id ?? p.specializationId ?? "",
        qualifications: (p.qualifications ?? []).join(", "),
        experienceYears: p.experienceYears ?? 0,
        consultationFee: p.consultationFee ?? 0,
        bio: p.bio ?? "",
        supportsOnline: p.supportsOnline ?? true,
        supportsInPerson: p.supportsInPerson ?? true,
      });
    }
  }, [profileData]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch("/doctors/me/profile", {
        method: "PUT",
        body: {
          ...form,
          qualifications: form.qualifications.split(",").map((q) => q.trim()).filter(Boolean),
        },
      }),
    onSuccess: () => setNotice("Profile saved. An admin must approve your profile before patients can book you."),
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not save your profile."),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-ink-900">Doctor profile</h1>

      <div className="mt-4">
        <AccountDetails />
      </div>

      {notice && <Alert kind="success">{notice}</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      <h2 className="mt-6 text-lg font-semibold text-ink-900">Specialization & consultation details</h2>
      <div className="card mt-4 space-y-4">
        <div>
          <label className="label">Specialization</label>
          <select className="input" value={form.specializationId} onChange={(e) => setForm((f) => ({ ...f, specializationId: e.target.value }))}>
            <option value="">Select specialization</option>
            {specData?.specializations.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Qualifications (comma-separated)</label>
          <input className="input" value={form.qualifications} onChange={(e) => setForm((f) => ({ ...f, qualifications: e.target.value }))} />
        </div>
        <div>
          <label className="label">Years of experience</label>
          <input type="number" min={0} className="input" value={form.experienceYears} onChange={(e) => setForm((f) => ({ ...f, experienceYears: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="label">Consultation fee (INR, 0 for none)</label>
          <input type="number" min={0} className="input" value={form.consultationFee} onChange={(e) => setForm((f) => ({ ...f, consultationFee: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input" rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.supportsOnline} onChange={(e) => setForm((f) => ({ ...f, supportsOnline: e.target.checked }))} />
            Offer online consultations
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.supportsInPerson} onChange={(e) => setForm((f) => ({ ...f, supportsInPerson: e.target.checked }))} />
            Offer in-person consultations
          </label>
        </div>
        <button className="btn-primary" onClick={() => save.mutate()} disabled={save.isPending || !form.specializationId}>
          {save.isPending ? "Saving..." : "Save profile"}
        </button>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-ink-900">Account & security</h2>
      <div className="mt-4">
        <AccountSettings />
      </div>
    </div>
  );
}
