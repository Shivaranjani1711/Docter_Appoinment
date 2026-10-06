import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { apiFetch, ApiError } from "../../api/client";
import { Alert } from "../../components/Alert";

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await apiFetch("/auth/reset-password", { method: "POST", body: { token, newPassword } });
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(
        err instanceof ApiError
          ? "This reset link is invalid or has expired. Please request a new one."
          : "Something went wrong. Please try again."
      );
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <Alert kind="error">This reset link is missing its token.</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-semibold text-ink-900">Set a new password</h1>
      {status === "done" ? (
        <div className="mt-6 space-y-4">
          <Alert kind="success">Your password has been reset. You can now log in.</Alert>
          <button className="btn-primary w-full" onClick={() => navigate("/login")}>
            Go to login
          </button>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {error && <Alert kind="error">{error}</Alert>}
          <div>
            <label className="label" htmlFor="newPassword">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={10}
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={status === "submitting"}>
            {status === "submitting" ? "Resetting..." : "Reset password"}
          </button>
        </form>
      )}
      <p className="mt-4 text-sm">
        <Link to="/login" className="text-brand-700 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
