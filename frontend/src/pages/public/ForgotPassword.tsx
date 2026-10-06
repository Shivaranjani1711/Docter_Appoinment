import { useState } from "react";
import { apiFetch } from "../../api/client";
import { Alert } from "../../components/Alert";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    await apiFetch("/auth/forgot-password", { method: "POST", body: { email } }).catch(() => undefined);
    setStatus("sent");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-semibold text-ink-900">Reset your password</h1>
      {status === "sent" ? (
        <Alert kind="success">
          If an account exists for that email, we've sent a password reset link to it.
        </Alert>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </div>
  );
}
