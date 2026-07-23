import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { listWorksheets } from "@/lib/content";
import { worksheetHref } from "@/lib/paths";
import { isTenantId, TENANTS } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";

type Props = { params: Promise<{ tenant: string }> };

export default async function TenantHomePage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);

  const config = TENANTS[tenant];
  const worksheets = await listWorksheets(tenant);

  return (
    <>
      <TenantNav tenantId={tenant} tenantName={config.name} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
        <p className="mt-2 text-stone-600">
          Open a worksheet to preview, edit markdown, or print. Repo markdown is
          the default; saves on the web go to KV for this tenant.
        </p>
        <section className="mt-8">
          <h2 className="text-lg font-medium text-stone-800">Worksheets</h2>
          <ul className="mt-3 space-y-2">
            {worksheets.map((w) => (
              <li key={w.slug}>
                <Link
                  href={worksheetHref(tenant, w.slug)}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-stone-200 bg-white px-4 py-3 hover:border-stone-400"
                >
                  <span className="font-medium text-stone-900">
                    {w.frontmatter.title}
                  </span>
                  <span className="text-sm text-stone-500">
                    {w.frontmatter.topic} · {w.source === "kv" ? "edited" : "repo"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/t/${tenant}/topics`}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
          >
            Browse GCSE topics
          </Link>
          <Link
            href={`/t/${tenant}/worksheets`}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800"
          >
            All worksheets
          </Link>
        </section>
      </main>
    </>
  );
}
