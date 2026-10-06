import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "../api/client";
import { Alert } from "./Alert";
import { LoadingState } from "./LoadingState";

interface Me {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  isEmailVerified: boolean;
}

export function AccountDetails() {
  const { data: me, isLoading, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<Me>("/users/me"),
  });
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  async function handleResend() {
    setResendState("sending");
    setResendError(null);
    try {
      await apiFetch("/auth/resend-verification", { method: "POST" });
      setResendState("sent");
    } catch (err) {
      setResendState("idle");
      setResendError(err instanceof ApiError ? err.message : "Could not resend the verification email.");
    }
  }

  if (isLoading) return <LoadingState label="Loading your details..." />;
  if (!me) return null;

  return (
    <div className="card">
      <h2 className="font-medium text-ink-900">Your details</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-500">Full name</dt>
          <dd className="text-ink-900">{me.fullName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-500">Email</dt>
          <dd className="text-ink-900">{me.email}</dd>
        </div>
        {me.phone && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Phone</dt>
            <dd className="text-ink-900">{me.phone}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-ink-500">Role</dt>
          <dd className="text-ink-900">{me.role.charAt(0) + me.role.slice(1).toLowerCase()}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink-500">Email verification</dt>
          <dd>
            <span className={`badge ${me.isEmailVerified ? "bg-success-50 text-success-600" : "bg-warning-50 text-warning-600"}`}>
              {me.isEmailVerified ? "Verified" : "Not verified"}
            </span>
          </dd>
        </div>
      </dl>

      {!me.isEmailVerified && (
        <div className="mt-4 border-t border-ink-100 pt-4">
          {resendError && <Alert kind="error">{resendError}</Alert>}
          {resendState === "sent" ? (
            <Alert kind="success">
              Verification link sent. This project doesn't have a real email provider configured yet, so
              the link is printed to the <strong>backend server's terminal</strong> instead of being
              emailed - look for a block starting with <code>[DEV EMAIL]</code>, copy the link inside it,
              and open it in your browser.
            </Alert>
          ) : (
            <>
              <p className="text-sm text-ink-600">
                You need to verify your email before you can book an appointment.
              </p>
              <button
                type="button"
                className="btn-secondary mt-2"
                onClick={handleResend}
                disabled={resendState === "sending"}
              >
                {resendState === "sending" ? "Sending..." : "Resend verification email"}
              </button>
            </>
          )}
          <button type="button" className="ml-2 mt-2 text-sm text-brand-700 hover:underline" onClick={() => refetch()}>
            I've verified - refresh status
          </button>
        </div>
      )}
    </div>
  );
}
