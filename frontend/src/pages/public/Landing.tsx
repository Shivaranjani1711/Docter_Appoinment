import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Book appointments",
    description:
      "Search doctors by specialization, see real availability, and book an in-person or online consultation.",
  },
  {
    title: "Online consultations",
    description: "Join a secure video consultation at your scheduled time, directly from your appointment.",
  },
  {
    title: "Medical reports",
    description: "Upload and store your medical reports privately, shared only with doctors you consult.",
  },
  {
    title: "Digital prescriptions",
    description: "View prescriptions from your doctor after a consultation, available any time in your account.",
  },
  {
    title: "Doctor availability",
    description: "Doctors set their own working hours, breaks and leave - you only see slots that are truly open.",
  },
  {
    title: "Hospital administration",
    description: "Hospital staff manage doctors, departments and appointments from a dedicated admin dashboard.",
  },
];

export function Landing() {
  return (
    <div>
      <section className="border-b border-ink-100 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Book in-person and online consultations with available doctors
          </h1>
          <p className="mt-4 max-w-xl text-ink-600">
            CareLine is an appointment and teleconsultation platform. Find a doctor, check real-time
            availability, and book the consultation type that works for you.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/doctors" className="btn-primary">
              Find a doctor
            </Link>
            <Link to="/register" className="btn-secondary">
              Create an account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-xl font-semibold text-ink-900">What you can do on CareLine</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <h3 className="font-medium text-ink-900">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-100 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Alert />
        </div>
      </section>
    </div>
  );
}

function Alert() {
  return (
    <div className="rounded-md border border-warning-500/30 bg-warning-50 p-4 text-sm text-warning-600">
      <strong>Not an emergency service.</strong> CareLine's emergency consultation feature connects you with
      an available doctor for teleconsultation - it is not a substitute for emergency medical services. In a
      medical emergency, contact your local emergency number or go to the nearest emergency facility.
    </div>
  );
}
