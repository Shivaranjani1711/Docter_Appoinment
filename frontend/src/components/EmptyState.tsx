export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink-200 p-8 text-center">
      <p className="font-medium text-ink-700">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
    </div>
  );
}
