const STYLES = {
  error: "bg-danger-50 text-danger-600 border-danger-500/20",
  warning: "bg-warning-50 text-warning-600 border-warning-500/20",
  success: "bg-success-50 text-success-600 border-success-500/20",
  info: "bg-brand-50 text-brand-700 border-brand-500/20",
};

export function Alert({ kind = "info", children }: { kind?: keyof typeof STYLES; children: React.ReactNode }) {
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-md border p-3 text-sm ${STYLES[kind]}`}>
      {children}
    </div>
  );
}
