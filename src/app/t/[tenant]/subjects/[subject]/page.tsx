import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import {
  mathsTopicCoverage,
  getAnswerKey,
  getWorksheet,
} from "@/lib/content";
import {
  DOMAIN_LABELS,
  MATHS_DOMAINS,
  SUBJECTS,
  topicsByDomain,
} from "@/lib/subjects";
import { isTenantId, TENANTS } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { mathsTopicHref } from "@/lib/paths";

type Props = { params: Promise<{ tenant: string; subject: string }> };

export default async function MathsSubjectPage({ params }: Props) {
  const { tenant, subject } = await params;
  if (!isTenantId(tenant) || subject !== "maths") notFound();
  await requireSession(tenant);
  const config = TENANTS[tenant];
  const meta = SUBJECTS.maths;
  const coverage = await mathsTopicCoverage(tenant);

  const domainSections = await Promise.all(
    MATHS_DOMAINS.map(async (domain) => {
      const topics = topicsByDomain(domain);
      const rows = await Promise.all(
        topics.map(async (t) => {
          const slug = `${domain}/${t.code}`;
          const ws = await getWorksheet(tenant, slug);
          const ak = await getAnswerKey(tenant, slug);
          return { t, ws, ak };
        }),
      );
      return { domain, rows };
    }),
  );

  return (
    <>
      <TenantNav tenantId={tenant} tenantName={config.name} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href={`/t/${tenant}/subjects`}
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          ← Subjects
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-stone-900">
          {meta.name}
        </h1>
        <p className="mt-2 text-stone-600">{meta.description}</p>

        <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          <p>
            <strong>Catalogue:</strong> {coverage.catalogCount} GCSE seed topics
            (age 9 → Foundation). Not the full GCSE spec — your tutoring spine.
          </p>
          <p className="mt-2">
            <strong>Worksheets:</strong> {coverage.withWorksheet} ·{" "}
            <strong>Answer keys:</strong> {coverage.withAnswerKey} for practice
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {domainSections.map(({ domain, rows }) => (
            <section key={domain}>
              <h2 className="border-b border-stone-200 pb-2 text-lg font-medium">
                {DOMAIN_LABELS[domain]}
              </h2>
              <ul className="mt-4 space-y-3">
                {rows.map(({ t, ws, ak }) => (
                  <li
                    key={t.code}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-mono text-xs text-stone-500">
                        {t.code}
                      </p>
                      <p className="font-medium text-stone-900">{t.title}</p>
                      <p className="mt-1 text-sm text-stone-600">
                        {t.age9Focus}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {ws ? "Worksheet ✓" : "Worksheet missing"} ·{" "}
                        {ak ? "Answers ✓" : "Answers pending"}
                      </p>
                    </div>
                    {ws ? (
                      <Link
                        href={mathsTopicHref(tenant, domain, t.code)}
                        className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm text-white"
                      >
                        Open
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
