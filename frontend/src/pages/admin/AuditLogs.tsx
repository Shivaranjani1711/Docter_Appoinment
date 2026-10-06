import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";

interface AuditLogRow {
  _id: string;
  actorId: { fullName: string; email: string; role: string } | null;
  action: string;
  targetType: string;
  targetId: string | null;
  createdAt: string;
}

export function AdminAuditLogs() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => apiFetch<{ logs: AuditLogRow[] }>("/admin/audit-logs"),
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900">Audit logs</h1>
      {isLoading && <LoadingState />}
      {!isLoading && data?.logs.length === 0 && <EmptyState title="No audit events recorded yet" />}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-left text-ink-500">
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Actor</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Target</th>
            </tr>
          </thead>
          <tbody>
            {data?.logs.map((l) => (
              <tr key={l._id} className="border-b border-ink-50">
                <td className="py-2 pr-4">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="py-2 pr-4">{l.actorId ? `${l.actorId.fullName} (${l.actorId.role})` : "System"}</td>
                <td className="py-2 pr-4">{l.action}</td>
                <td className="py-2 pr-4">{l.targetType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
