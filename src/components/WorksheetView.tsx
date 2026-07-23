import Link from "next/link";
import { topicByCode } from "@/lib/topics/catalog";
import { MarkdownBody } from "@/components/MarkdownBody";
import type { WorksheetDoc } from "@/lib/content";

export function WorksheetView({
  tenant,
  doc,
  baseHref,
}: {
  tenant: string;
  doc: WorksheetDoc;
  baseHref: string;
}) {
  const topic = topicByCode(doc.frontmatter.topic);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 print:max-w-none print:py-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/t/${tenant}/worksheets`}
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          ← Worksheets
        </Link>
        <div className="flex gap-2">
          <Link
            href={`${baseHref}/edit`}
            className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
          >
            Edit markdown
          </Link>
          <Link
            href={`${baseHref}/print`}
            className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm text-white"
          >
            Print layout
          </Link>
        </div>
      </div>

      <article className="worksheet-sheet rounded-xl border border-stone-200 bg-white p-8 print:border-0 print:p-0">
        <header className="worksheet-header border-b border-stone-300 pb-4">
          <p className="text-xs uppercase tracking-wide text-stone-500">
            {doc.frontmatter.topic}
            {topic ? ` · ${topic.title}` : ""}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-900">
            {doc.frontmatter.title}
          </h1>
          {doc.frontmatter.ao?.length ? (
            <p className="mt-2 text-sm text-stone-600">
              {doc.frontmatter.ao.join(" · ")}
            </p>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm print:grid-cols-3">
            <div className="border-b border-stone-400 pb-1">Name</div>
            <div className="border-b border-stone-400 pb-1">Date</div>
            <div className="hidden border-b border-stone-400 pb-1 print:block">
              Score
            </div>
          </div>
        </header>
        <MarkdownBody markdown={doc.body} className="worksheet-markdown mt-6" />
        {doc.source === "kv" ? (
          <p className="mt-8 text-xs text-amber-700 print:hidden">
            Showing saved web edit (KV). Git copy unchanged until you commit
            markdown.
          </p>
        ) : null}
      </article>
    </main>
  );
}
