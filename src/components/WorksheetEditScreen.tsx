import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getWorksheet, serializeWorksheet } from "@/lib/content";
import { isTenantId, TENANTS } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { WorksheetEditor } from "@/components/WorksheetEditor";

export async function WorksheetEditScreen({
  tenant,
  slug,
}: {
  tenant: string;
  slug: string;
}) {
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
          Save writes to KV for this tenant. Commit markdown in Git for permanent
          copies under <code className="rounded bg-stone-100 px-1">content/tenants/{tenant}/topics/</code>.
        </p>
        <WorksheetEditor tenant={tenant} slug={slug} initialMarkdown={raw} />
      </main>
    </>
  );
}
