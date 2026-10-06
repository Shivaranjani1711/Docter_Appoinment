import { Link } from "react-router-dom";

export function EmergencyInfo() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-ink-900">Emergency consultation</h1>
      <div className="mt-4 rounded-md border border-danger-500/30 bg-danger-50 p-4 text-sm text-danger-600">
        <strong>This is not an emergency medical service.</strong> If you are experiencing a life-threatening
        emergency, contact your local emergency number or go to the nearest emergency facility immediately.
        Do not wait for a response on this Platform.
      </div>
      <p className="mt-4 text-ink-600">
        CareLine's Emergency Consultation feature lets you request a teleconsultation with any currently
        available doctor who supports online consultations. It is provided on a best-effort basis: there is
        no guarantee a doctor will be available immediately, and requests may expire if unanswered.
      </p>
      <p className="mt-3 text-ink-600">
        Use this feature for non-life-threatening but urgent concerns where speaking with a doctor sooner
        than your next scheduled appointment would help - not as a replacement for emergency services.
      </p>
      <Link to="/login" className="btn-primary mt-6 inline-flex">
        Log in to request a consultation
      </Link>
    </div>
  );
}
