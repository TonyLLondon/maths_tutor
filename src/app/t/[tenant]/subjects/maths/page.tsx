import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { countWorksheetsInDomain } from "@/lib/maths-browse";
import { loadStarterTopics } from "@/lib/starter-topics";
import {
  DOMAIN_LABELS,
  DOMAIN_SUMMARIES,
  MATHS_DOMAINS,
  SUBJECTS,
  topicsByDomain,
} from "@/lib/subjects";
import { isTenantId } from "@/lib/tenants";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { MathsTopicRow } from "@/components/MathsTopicRow";
import { loadMathsTopicListRows } from "@/lib/maths-browse";
import { mathsHomeTrail } from "@/lib/nav-crumbs";
import { mathsDomainHref } from "@/lib/paths";

type Props = { params: Promise<{ tenant: string }> };

export default async function MathsHomePage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  const session = await requireSession(tenant);
  const starter = await loadStarterTopics(tenant);
  const meta = SUBJECTS.maths;

  const domainStats = await Promise.all(
    MATHS_DOMAINS.map(async (domain) => ({
      domain,
      ...(await countWorksheetsInDomain(tenant, domain)),
    })),
  );

  const pathRows = await Promise.all(
    starter.map(async (p) => {
      const t = topicsByDomain(p.domain).find((x) => x.code === p.code);
      if (!t) return null;
      const rows = await loadMathsTopicListRows(
        tenant,
        session.userId,
        p.domain,
      );
      return rows.find((r) => r.t.code === t.code) ?? null;
    }),
  );

  return (
    <>
      <ServerTenantNav tenantId={tenant} crumbs={mathsHomeTrail(tenant)} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">{meta.name}</h1>
        <p className="mt-2 text-stone-600">
          Pick an area, then choose a topic. Or start with a shortcut below.
        </p>
        <p className="mt-3">
          <Link
            href={`/t/${tenant}/subjects/maths/learn`}
            className="text-sm font-medium text-violet-800 underline decoration-violet-300 underline-offset-2"
          >
            Guides and maths words
          </Link>
        </p>

        {starter.length > 0 ? (
          <section className="mt-10">
            <h2 className="border-b border-stone-200 pb-2 text-lg font-medium">
              Start here
            </h2>
            <ul className="mt-4 space-y-3">
              {pathRows.filter(Boolean).map((row) => (
                <MathsTopicRow
                  key={`${row!.domain}/${row!.t.code}`}
                  tenant={tenant}
                  starter={starter}
                  {...row!}
                />
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-12">
          <h2 className="border-b border-stone-200 pb-2 text-lg font-medium">
            Browse by area
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {domainStats.map(({ domain, ready, total }) => (
              <li key={domain}>
                <Link
                  href={mathsDomainHref(tenant, domain)}
                  className="block h-full rounded-xl border border-stone-200 bg-white p-5 hover:border-stone-400"
                >
                  <h3 className="font-semibold text-stone-900">
                    {DOMAIN_LABELS[domain]}
                  </h3>
                  <p className="mt-1.5 text-sm text-stone-600">
                    {DOMAIN_SUMMARIES[domain]}
                  </p>
                  <p className="mt-3 text-xs font-medium text-stone-500">
                    {ready}/{total} topics ready
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
