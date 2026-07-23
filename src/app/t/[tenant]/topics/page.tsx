import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { isTenantId, TENANTS } from "@/lib/tenants";
import {
  DOMAIN_LABELS,
  TOPICS,
  topicsByDomain,
  type GcseDomain,
} from "@/lib/topics/catalog";
import { TenantNav } from "@/components/TenantNav";
import { worksheetHref } from "@/lib/paths";

type Props = { params: Promise<{ tenant: string }> };

const DOMAINS: GcseDomain[] = [
  "number",
  "algebra",
  "ratio",
  "geometry",
  "probability",
  "statistics",
];

export default async function TopicsPage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);
  const config = TENANTS[tenant];

  return (
    <>
      <TenantNav tenantId={tenant} tenantName={config.name} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">GCSE topic map</h1>
        <p className="mt-2 text-stone-600">
          Same six domains as AQA / Edexcel / OCR Foundation. Age-9 focus notes
          for worksheet design.
        </p>
        <div className="mt-8 space-y-10">
          {DOMAINS.map((domain) => (
            <section key={domain}>
              <h2 className="border-b border-stone-200 pb-2 text-lg font-medium text-stone-800">
                {DOMAIN_LABELS[domain]}
              </h2>
              <ul className="mt-4 space-y-4">
                {topicsByDomain(domain).map((t) => (
                  <li
                    key={t.code}
                    className="rounded-lg border border-stone-200 bg-white px-4 py-3"
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-mono text-sm text-stone-500">
                        {t.code}
                      </span>
                      <span className="font-medium text-stone-900">
                        {t.title}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-stone-600">{t.summary}</p>
                    <p className="mt-2 text-sm text-stone-800">
                      <span className="font-medium">Age 9:</span> {t.age9Focus}
                    </p>
                    <Link
                      href={worksheetHref(tenant, `${domain}/${t.code}`)}
                      className="mt-3 inline-block text-sm font-medium text-stone-900 underline"
                    >
                      Open worksheet · Print
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-10 text-xs text-stone-400">
          {TOPICS.length} seed topics in catalog · extend in{" "}
          <code className="rounded bg-stone-100 px-1">src/lib/topics/catalog.ts</code>
        </p>
      </main>
    </>
  );
}
