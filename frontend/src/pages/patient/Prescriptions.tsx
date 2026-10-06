import { useMyPrescriptions } from "../../api/hooks";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";

export function PatientPrescriptions() {
  const { data, isLoading } = useMyPrescriptions();

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Prescriptions</h1>
      {isLoading && <LoadingState />}
      {!isLoading && data?.prescriptions.length === 0 && (
        <EmptyState title="No prescriptions yet" description="Prescriptions appear here after a completed consultation." />
      )}
      <div className="mt-4 space-y-4">
        {data?.prescriptions.map((p) => (
          <div key={p._id} className="card">
            <p className="text-sm text-ink-500">{new Date(p.createdAt).toLocaleDateString()}</p>
            {p.diagnosisNotes && <p className="mt-1 font-medium text-ink-900">{p.diagnosisNotes}</p>}
            {p.medicines.length > 0 && (
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-ink-500">
                    <th className="py-1 pr-2">Medicine</th>
                    <th className="py-1 pr-2">Dosage</th>
                    <th className="py-1 pr-2">Frequency</th>
                    <th className="py-1 pr-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {p.medicines.map((m, i) => (
                    <tr key={i} className="border-b border-ink-50">
                      <td className="py-1 pr-2">{m.name}</td>
                      <td className="py-1 pr-2">{m.dosage}</td>
                      <td className="py-1 pr-2">{m.frequency}</td>
                      <td className="py-1 pr-2">{m.durationDays ? `${m.durationDays} days` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {p.advice && <p className="mt-3 text-sm text-ink-700">Advice: {p.advice}</p>}
            {p.followUpDate && (
              <p className="mt-1 text-sm text-ink-700">Follow-up: {new Date(p.followUpDate).toLocaleDateString()}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
