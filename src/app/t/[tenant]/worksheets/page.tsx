import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { listWorksheets } from "@/lib/content";
import { worksheetHref } from "@/lib/paths";
import { isTenantId, TENANTS } from "@/lib/tenants";
import { topicByCode } from "@/lib/topics/catalog";
import { TenantNav } from "@/components/TenantNav";

type Props = { params: Promise<{ tenant: string }> };

export default async function WorksheetsIndexPage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);
  const config = TENANTS[tenant];
  const worksheets = await listWorksheets(tenant);

  return (
    <>
      <TenantNav tenantId={tenant} tenantName={config.name} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">Worksheets</h1>
        <p className="mt-2 text-sm text-stone-600">
          Markdown in{" "}
          <code className="rounded bg-stone-100 px-1">
            content/tenants/{tenant}/topics/
          </code>
        </p>
        <ul className="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
          {worksheets.map((w) => {
            const topic = topicByCode(w.frontmatter.topic);
            return (
              <li key={w.slug} className="px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={worksheetHref(tenant, w.slug)}
                      className="text-lg font-medium text-stone-900 hover:underline"
                    >
                      {w.frontmatter.title}
                    </Link>
                    <p className="mt-1 text-sm text-stone-500">
                      {w.frontmatter.topic}
                      {topic ? ` · ${topic.title}` : ""}
                      {w.frontmatter.week != null
                        ? ` · Week ${w.frontmatter.week}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`${worksheetHref(tenant, w.slug)}/print`}
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm"
                    >
                      Print
                    </Link>
                    <Link
                      href={`${worksheetHref(tenant, w.slug)}/edit`}
                      className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm text-white"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
