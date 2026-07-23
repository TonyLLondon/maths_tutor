import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getWorksheet } from "@/lib/content";
import { isTenantId, TENANTS } from "@/lib/tenants";
import { topicByCode } from "@/lib/topics/catalog";
import { MarkdownBody } from "@/components/MarkdownBody";
import { PrintToolbar } from "./PrintToolbar";

type Props = { params: Promise<{ tenant: string; slug: string }> };

export default async function WorksheetPrintPage({ params }: Props) {
  const { tenant, slug } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);

  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const config = TENANTS[tenant];
  const topic = topicByCode(doc.frontmatter.topic);

  return (
    <>
      <PrintToolbar tenant={tenant} slug={slug} />
      <div className="worksheet-print-page mx-auto max-w-[210mm] bg-white px-[12mm] py-[10mm] print:mx-0 print:max-w-none print:px-[12mm]">
        <header className="worksheet-header border-b-2 border-stone-800 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10pt] uppercase tracking-wide text-stone-600">
                {config.name} · Maths
              </p>
              <h1 className="text-[16pt] font-bold leading-tight text-stone-900">
                {doc.frontmatter.title}
              </h1>
              <p className="mt-1 text-[10pt] text-stone-600">
                GCSE {doc.frontmatter.topic}
                {topic ? ` — ${topic.title}` : ""}
              </p>
            </div>
            {doc.frontmatter.week != null ? (
              <p className="text-[10pt] text-stone-600">Week {doc.frontmatter.week}</p>
            ) : null}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-6 text-[11pt]">
            <div>
              <span className="text-stone-500">Name</span>
              <div className="mt-3 border-b border-stone-800" />
            </div>
            <div>
              <span className="text-stone-500">Date</span>
              <div className="mt-3 border-b border-stone-800" />
            </div>
            <div>
              <span className="text-stone-500">Score</span>
              <div className="mt-3 border-b border-stone-800" />
            </div>
          </div>
          {doc.frontmatter.printNotes ? (
            <p className="mt-3 text-[9pt] italic text-stone-600">
              {doc.frontmatter.printNotes}
            </p>
          ) : null}
        </header>
        <MarkdownBody markdown={doc.body} className="worksheet-markdown mt-5" />
        <footer className="mt-8 border-t border-stone-300 pt-2 text-[8pt] text-stone-500">
          Working space: use the lines under each question or spare paper.
        </footer>
      </div>
    </>
  );
}
