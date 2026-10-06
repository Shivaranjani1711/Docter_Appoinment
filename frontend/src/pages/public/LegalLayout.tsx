import type { ReactNode } from "react";

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-ink-900">{title}</h1>
      <p className="mt-1 text-sm text-ink-500">Last updated: {updated}</p>
      <div className="prose prose-sm mt-6 max-w-none text-ink-700 [&>h2]:mt-8 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:text-ink-900 [&>p]:mt-3 [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-5">
        {children}
      </div>
    </div>
  );
}

export function LegalNotice() {
  return (
    <p className="mt-10 rounded-md border border-warning-500/30 bg-warning-50 p-4 text-sm text-warning-600">
      This document is a configurable template for a student/demonstration project. It is not a substitute
      for legal advice. Review with a qualified legal professional, and replace the CONFIGURE_ placeholders
      with real business details, before any production use.
    </p>
  );
}
