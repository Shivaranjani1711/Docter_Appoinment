import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { Alert } from "../../components/Alert";
import { LoadingState } from "../../components/LoadingState";

export function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    apiFetch("/auth/verify-email", { method: "POST", body: { token } })
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="mx-auto max-w-sm px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-ink-900">Email verification</h1>
      <div className="mt-6">
        {status === "checking" && <LoadingState label="Verifying your email..." />}
        {status === "ok" && <Alert kind="success">Your email has been verified. You can now book appointments.</Alert>}
        {status === "error" && (
          <Alert kind="error">This verification link is invalid or has expired.</Alert>
        )}
      </div>
      <Link to="/login" className="btn-primary mt-6 inline-flex">
        Go to login
      </Link>
    </div>
  );
}
