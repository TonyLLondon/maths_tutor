"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiWorksheetPath, worksheetHref } from "@/lib/paths";

type Props = {
  tenant: string;
  slug: string;
  initialMarkdown: string;
};

export function WorksheetEditor({ tenant, slug, initialMarkdown }: Props) {
  const router = useRouter();
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const preview = worksheetHref(tenant, slug);

  async function save() {
    setPending(true);
    setStatus(null);
    try {
      const res = await fetch(apiWorksheetPath(tenant, slug), {
        method: "PUT",
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: markdown,
      });
      if (!res.ok) {
        setStatus("Save failed.");
        return;
      }
      setStatus("Saved to KV.");
      router.refresh();
    } catch {
      setStatus("Save failed.");
    } finally {
      setPending(false);
    }
  }

  async function resetToRepo() {
    if (!confirm("Remove KV override and show the Git repo version again?")) {
      return;
    }
    setPending(true);
    try {
      await fetch(apiWorksheetPath(tenant, slug), { method: "DELETE" });
      router.refresh();
      const res = await fetch(apiWorksheetPath(tenant, slug));
      if (res.ok) {
        setMarkdown(await res.text());
        setStatus("Reset to repo default.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        spellCheck={false}
        className="min-h-[420px] w-full rounded-xl border border-stone-300 p-4 font-mono text-sm leading-relaxed text-stone-900 outline-none ring-stone-400 focus:ring-2"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => void save()}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Save to KV
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void resetToRepo()}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
        >
          Reset to repo
        </button>
        <Link href={preview} className="text-sm text-stone-600 underline">
          Preview
        </Link>
        {status ? <span className="text-sm text-stone-600">{status}</span> : null}
      </div>
    </div>
  );
}
