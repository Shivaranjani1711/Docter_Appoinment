import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface NavItem {
  to: string;
  label: string;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  PATIENT: [
    { to: "/patient/dashboard", label: "Dashboard" },
    { to: "/patient/doctors", label: "Find a doctor" },
    { to: "/patient/appointments", label: "Appointments" },
    { to: "/patient/reports", label: "Medical reports" },
    { to: "/patient/prescriptions", label: "Prescriptions" },
    { to: "/patient/emergency", label: "Emergency consultation" },
    { to: "/patient/profile", label: "Profile" },
  ],
  DOCTOR: [
    { to: "/doctor/dashboard", label: "Today" },
    { to: "/doctor/appointments", label: "Appointments" },
    { to: "/doctor/availability", label: "Availability" },
    { to: "/doctor/emergency", label: "Emergency queue" },
    { to: "/doctor/profile", label: "Profile" },
  ],
  ADMIN: [
    { to: "/admin/dashboard", label: "Overview" },
    { to: "/admin/doctors", label: "Doctors" },
    { to: "/admin/patients", label: "Patients" },
    { to: "/admin/departments", label: "Departments" },
    { to: "/admin/appointments", label: "Appointments" },
    { to: "/admin/analytics", label: "Analytics" },
    { to: "/admin/audit-logs", label: "Audit logs" },
    { to: "/admin/profile", label: "Account" },
  ],
};

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;
  const items = NAV_BY_ROLE[user.role] ?? [];

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-ink-100 bg-ink-50 p-4">
        <Link to="/" className="mb-6 block text-lg font-semibold text-ink-900">
          CareLine
        </Link>
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-sm px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-ink-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 border-t border-ink-200 pt-4">
          <p className="truncate text-sm font-medium text-ink-800">{user.fullName}</p>
          <p className="truncate text-xs text-ink-500">{user.email}</p>
          <button type="button" onClick={handleLogout} className="btn-secondary mt-3 w-full">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-white p-6">
        <Outlet />
      </main>
    </div>
  );
}
