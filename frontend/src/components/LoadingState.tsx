export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 py-6 text-sm text-ink-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-brand-600" />
      {label}
    </div>
  );
}
