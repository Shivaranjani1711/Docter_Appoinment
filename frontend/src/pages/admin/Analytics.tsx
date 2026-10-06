import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import { LoadingState } from "../../components/LoadingState";
import { EmptyState } from "../../components/EmptyState";

export function AdminAnalytics() {
  const { data: trendData, isLoading: loadingTrend } = useQuery({
    queryKey: ["analytics-trend"],
    queryFn: () => apiFetch<{ trend: { date: string; count: number }[] }>("/admin/analytics/trend?days=30"),
  });
  const { data: specData, isLoading: loadingSpec } = useQuery({
    queryKey: ["analytics-specializations"],
    queryFn: () => apiFetch<{ distribution: { specialization: string; count: number }[] }>("/admin/analytics/specializations"),
  });

  const maxTrend = Math.max(1, ...(trendData?.trend.map((t) => t.count) ?? [0]));
  const maxSpec = Math.max(1, ...(specData?.distribution.map((s) => s.count) ?? [0]));

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-ink-900">Analytics</h1>

      <div className="card mt-4">
        <h2 className="font-medium text-ink-900">Appointments created - last 30 days</h2>
        {loadingTrend ? (
          <LoadingState />
        ) : trendData?.trend.length === 0 ? (
          <EmptyState title="No data available" description="Appointment trends will appear once bookings are made." />
        ) : (
          <div className="mt-3 space-y-1">
            {trendData?.trend.map((t) => (
              <div key={t.date} className="flex items-center gap-2 text-sm">
                <span className="w-24 shrink-0 text-ink-500">{t.date}</span>
                <div className="h-3 flex-1 rounded-sm bg-ink-50">
                  <div className="h-3 rounded-sm bg-brand-500" style={{ width: `${(t.count / maxTrend) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-ink-700">{t.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mt-4">
        <h2 className="font-medium text-ink-900">Appointments by specialization</h2>
        {loadingSpec ? (
          <LoadingState />
        ) : specData?.distribution.length === 0 ? (
          <EmptyState title="No data available" />
        ) : (
          <div className="mt-3 space-y-1">
            {specData?.distribution.map((s) => (
              <div key={s.specialization} className="flex items-center gap-2 text-sm">
                <span className="w-40 shrink-0 text-ink-500">{s.specialization}</span>
                <div className="h-3 flex-1 rounded-sm bg-ink-50">
                  <div className="h-3 rounded-sm bg-brand-500" style={{ width: `${(s.count / maxSpec) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-ink-700">{s.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
