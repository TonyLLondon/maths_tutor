import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getWorksheet, serializeWorksheet } from "@/lib/content";
import { isTenantId, TENANTS } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { WorksheetEditor } from "./WorksheetEditor";

type Props = { params: Promise<{ tenant: string; slug: string }> };

export default async function WorksheetEditPage({ params }: Props) {
  const { tenant, slug } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);

  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const config = TENANTS[tenant];
  const raw = serializeWorksheet(doc.frontmatter, doc.body);

  return (
    <>
      <TenantNav tenantId={tenant} tenantName={config.name} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-xl font-semibold text-stone-900">Edit worksheet</h1>
        <p className="mt-2 text-sm text-stone-600">
          Full markdown with YAML frontmatter. Save writes to Vercel KV for tenant{" "}
          <strong>{tenant}</strong>. To version in Git, copy into{" "}
          <code className="rounded bg-stone-100 px-1">
            content/tenants/{tenant}/worksheets/{slug}.md
          </code>
          .
        </p>
        <WorksheetEditor tenant={tenant} slug={slug} initialMarkdown={raw} />
      </main>
    </>
  );
}
