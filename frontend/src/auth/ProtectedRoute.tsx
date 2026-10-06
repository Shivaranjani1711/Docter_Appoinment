import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { UserRole } from "../types";
import { LoadingState } from "../components/LoadingState";

export function ProtectedRoute({ allow }: { allow: UserRole[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Checking your session..." />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
