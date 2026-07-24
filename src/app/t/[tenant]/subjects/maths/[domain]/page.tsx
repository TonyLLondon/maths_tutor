import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { loadMathsTopicListRows } from "@/lib/maths-browse";
import { loadStarterTopics } from "@/lib/starter-topics";
import { DOMAIN_LABELS, isGcseDomain } from "@/lib/subjects";
import { isTenantId } from "@/lib/tenants";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { MathsTopicRow } from "@/components/MathsTopicRow";
import { mathsDomainTrail } from "@/lib/nav-crumbs";

type Props = { params: Promise<{ tenant: string; domain: string }> };

export default async function MathsDomainPage({ params }: Props) {
  const { tenant, domain: domainParam } = await params;
  if (!isTenantId(tenant) || !isGcseDomain(domainParam)) notFound();

  const session = await requireSession(tenant);
  const starter = await loadStarterTopics(tenant);
  const rows = await loadMathsTopicListRows(
    tenant,
    session.userId,
    domainParam,
  );

  return (
    <>
      <ServerTenantNav
        tenantId={tenant}
        crumbs={mathsDomainTrail(tenant, domainParam)}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">
          {DOMAIN_LABELS[domainParam]}
        </h1>
        <p className="mt-2 text-stone-600">
          {rows.filter((r) => r.ws).length} of {rows.length} topics ready to
          practice.
        </p>
        <ul className="mt-8 space-y-3">
          {rows.map((row) => (
            <MathsTopicRow
              key={row.t.code}
              tenant={tenant}
              starter={starter}
              {...row}
            />
          ))}
        </ul>
      </main>
    </>
  );
}
