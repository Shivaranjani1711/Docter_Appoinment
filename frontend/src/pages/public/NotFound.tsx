import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink-900">Page not found</h1>
      <p className="mt-2 text-ink-600">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Back to home
      </Link>
    </div>
  );
}
