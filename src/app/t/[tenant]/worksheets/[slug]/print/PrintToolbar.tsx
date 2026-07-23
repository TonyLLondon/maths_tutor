"use client";

import Link from "next/link";

export function PrintToolbar({
  tenant,
  slug,
}: {
  tenant: string;
  slug: string;
}) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-stone-100 px-4 py-2 print:hidden">
      <Link
        href={`/t/${tenant}/worksheets/${slug}`}
        className="text-sm text-stone-600 hover:text-stone-900"
      >
        ← Back
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
      >
        Print / Save PDF
      </button>
    </div>
  );
}
