import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiFetch, ApiError } from "../../api/client";
import { Alert } from "../../components/Alert";
import { AccountSettings } from "../../components/AccountSettings";
import { AccountDetails } from "../../components/AccountDetails";
import { useAuth } from "../../auth/AuthContext";

interface FormValues {
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export function PatientProfile() {
  const { user } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: { fullName: user?.fullName } });

  async function onSubmit(values: FormValues) {
    setNotice(null);
    setError(null);
    try {
      await apiFetch("/users/me", { method: "PUT", body: values });
      setNotice("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update your profile.");
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-ink-900">Your profile</h1>

      <div className="mt-4">
        <AccountDetails />
      </div>

      <h2 className="mt-8 text-lg font-semibold text-ink-900">Edit your details</h2>
      <form className="card mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {notice && <Alert kind="success">{notice}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}

        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input id="fullName" className="input" {...register("fullName")} />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input id="phone" className="input" {...register("phone")} />
        </div>
        <div>
          <label className="label" htmlFor="dateOfBirth">
            Date of birth
          </label>
          <input id="dateOfBirth" type="date" className="input" {...register("dateOfBirth")} />
        </div>
        <div>
          <label className="label" htmlFor="address">
            Address
          </label>
          <textarea id="address" className="input" rows={2} {...register("address")} />
        </div>
        <div>
          <label className="label" htmlFor="emergencyContactName">
            Emergency contact name
          </label>
          <input id="emergencyContactName" className="input" {...register("emergencyContactName")} />
        </div>
        <div>
          <label className="label" htmlFor="emergencyContactPhone">
            Emergency contact phone
          </label>
          <input id="emergencyContactPhone" className="input" {...register("emergencyContactPhone")} />
        </div>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>

      <h2 className="mt-8 text-lg font-semibold text-ink-900">Account & security</h2>
      <div className="mt-4">
        <AccountSettings />
      </div>
    </div>
  );
}
