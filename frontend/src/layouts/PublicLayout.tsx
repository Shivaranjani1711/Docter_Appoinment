import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function PublicLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ink-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-ink-900">
            CareLine
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/doctors" className="text-ink-600 hover:text-ink-900">
              Find a doctor
            </Link>
            <Link to="/emergency-info" className="text-ink-600 hover:text-ink-900">
              Emergency
            </Link>
            {user ? (
              <Link to={`/${user.role.toLowerCase()}/dashboard`} className="btn-primary">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-ink-600 hover:text-ink-900">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink-100 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-600">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/privacy-policy" className="hover:text-ink-900">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="hover:text-ink-900">
              Terms and Conditions
            </Link>
            <Link to="/cookie-policy" className="hover:text-ink-900">
              Cookie Policy
            </Link>
            <Link to="/refund-policy" className="hover:text-ink-900">
              Refund Policy
            </Link>
            <Link to="/contact" className="hover:text-ink-900">
              Contact
            </Link>
          </div>
          <p className="mt-4 text-ink-500">
            CareLine is an appointment and teleconsultation management platform. It does not provide
            emergency medical services. In a medical emergency, contact your local emergency services
            immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}
