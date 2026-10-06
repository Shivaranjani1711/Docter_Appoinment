import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Alert } from "./Alert";

export function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPasswordForPw, setCurrentPasswordForPw] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSubmitting(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: { currentPassword: currentPasswordForPw, newPassword },
      });
      // Changing the password revokes every session on the server, including
      // this one's refresh token - log out locally and send the user to log in again.
      await logout();
      navigate("/login", { state: { notice: "Password changed. Please log in again." } });
    } catch (err) {
      setPwSubmitting(false);
      if (err instanceof ApiError && err.code === "INVALID_CURRENT_PASSWORD") {
        setPwError("Your current password is incorrect.");
      } else if (err instanceof ApiError) {
        setPwError(err.message);
      } else {
        setPwError("Could not change your password. Please try again.");
      }
    }
  }

  async function onChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setEmailNotice(null);
    setEmailSubmitting(true);
    try {
      await apiFetch("/auth/change-email", {
        method: "POST",
        body: { newEmail, currentPassword: currentPasswordForEmail },
      });
      setEmailNotice("Email updated. We've sent a new verification link to your new address.");
      setNewEmail("");
      setCurrentPasswordForEmail("");
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_IN_USE") {
        setEmailError("An account with this email already exists.");
      } else if (err instanceof ApiError && err.code === "INVALID_CURRENT_PASSWORD") {
        setEmailError("Your current password is incorrect.");
      } else {
        setEmailError("Could not update your email. Please try again.");
      }
    } finally {
      setEmailSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="font-medium text-ink-900">Change password</h2>
        <form className="mt-3 space-y-3" onSubmit={onChangePassword}>
          {pwError && <Alert kind="error">{pwError}</Alert>}
          <div>
            <label className="label" htmlFor="currentPasswordForPw">
              Current password
            </label>
            <input
              id="currentPasswordForPw"
              type="password"
              required
              className="input"
              value={currentPasswordForPw}
              onChange={(e) => setCurrentPasswordForPw(e.target.value)}
            />
          </div>
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
            <p className="mt-1 text-xs text-ink-500">At least 10 characters, with an uppercase letter, a lowercase letter, and a number.</p>
          </div>
          <button type="submit" className="btn-primary" disabled={pwSubmitting}>
            {pwSubmitting ? "Changing..." : "Change password"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-medium text-ink-900">Change email</h2>
        <p className="mt-1 text-sm text-ink-500">Current email: {user?.email}</p>
        <form className="mt-3 space-y-3" onSubmit={onChangeEmail}>
          {emailError && <Alert kind="error">{emailError}</Alert>}
          {emailNotice && <Alert kind="success">{emailNotice}</Alert>}
          <div>
            <label className="label" htmlFor="newEmail">
              New email
            </label>
            <input
              id="newEmail"
              type="email"
              required
              className="input"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="currentPasswordForEmail">
              Current password
            </label>
            <input
              id="currentPasswordForEmail"
              type="password"
              required
              className="input"
              value={currentPasswordForEmail}
              onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={emailSubmitting}>
            {emailSubmitting ? "Updating..." : "Change email"}
          </button>
        </form>
      </div>
    </div>
  );
}
