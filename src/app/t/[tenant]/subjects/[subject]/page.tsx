import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getWorksheet } from "@/lib/content";
import {
  DOMAIN_LABELS,
  MATHS_DOMAINS,
  SUBJECTS,
  topicsByDomain,
} from "@/lib/subjects";
import { primaryTopicLabelWithStarter } from "@/lib/topic-labels";
import { loadStarterTopics } from "@/lib/starter-topics";
import { isTenantId } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { mathsHomeTrail } from "@/lib/nav-crumbs";
import { getTopicProgressState } from "@/lib/progress";
import { formatLevel } from "@/lib/practice-rating";
import { mathsTopicHref } from "@/lib/paths";

type Props = { params: Promise<{ tenant: string; subject: string }> };

type Row = {
  domain: string;
  t: ReturnType<typeof topicsByDomain>[number];
  ws: Awaited<ReturnType<typeof getWorksheet>>;
  level: number | null;
};

function TopicRow({
  tenant,
  domain,
  t,
  ws,
  starter,
  level,
}: Row & { tenant: string; starter: Awaited<ReturnType<typeof loadStarterTopics>> }) {
  const label = primaryTopicLabelWithStarter(starter, t);
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3">
      <div>
        <p
          className={
            ws ? "font-medium text-stone-900" : "font-medium text-stone-400"
          }
        >
          {label}
        </p>
        {label !== t.title ? (
          <p className="mt-0.5 text-xs text-stone-500">{t.title}</p>
        ) : null}
        {ws && level != null ? (
          <p className="mt-1.5 text-sm text-stone-600">
            Your level{" "}
            <span className="font-semibold tabular-nums text-stone-900">
              {formatLevel(level)}
            </span>
          </p>
        ) : null}
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
  );
}

export default async function MathsSubjectPage({ params }: Props) {
  const { tenant, subject } = await params;
  if (!isTenantId(tenant) || subject !== "maths") notFound();
  const session = await requireSession(tenant);
  const meta = SUBJECTS.maths;

  const starter = await loadStarterTopics(tenant);

  async function topicRow(
    domain: string,
    t: ReturnType<typeof topicsByDomain>[number],
  ): Promise<Row> {
    const slug = `${domain}/${t.code}`;
    const ws = await getWorksheet(tenant, slug);
    const level = ws
      ? (await getTopicProgressState(session.userId, "maths", slug)).rating
      : null;
    return { domain, t, ws, level };
  }

  const pathRows = await Promise.all(
    starter.map(async (p) => {
      const t = topicsByDomain(p.domain).find((x) => x.code === p.code);
      if (!t) return null;
      return topicRow(p.domain, t);
    }),
  );

  const domainSections = await Promise.all(
    MATHS_DOMAINS.map(async (domain) => {
      const topics = topicsByDomain(domain);
      const rows = await Promise.all(topics.map((t) => topicRow(domain, t)));
      return { domain, rows };
    }),
  );

  return (
    <>
      <TenantNav
        tenantId={tenant}
        userName={session.displayName}
        crumbs={mathsHomeTrail(tenant)}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">{meta.name}</h1>
        <p className="mt-2 text-stone-600">
          Start with the topics below. Parents can open the full list when needed.
        </p>

        {starter.length > 0 ? (
          <section className="mt-10">
            <h2 className="border-b border-stone-200 pb-2 text-lg font-medium">
              Start here
            </h2>
            <ul className="mt-4 space-y-3">
              {pathRows.filter(Boolean).map((row) => (
                <TopicRow
                  key={`${row!.domain}/${row!.t.code}`}
                  tenant={tenant}
                  domain={row!.domain}
                  t={row!.t}
                  ws={row!.ws}
                  starter={starter}
                  level={row!.level}
                />
              ))}
            </ul>
          </section>
        ) : null}

        <details className="mt-12 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-stone-800">
            All topics (86) — full GCSE Foundation list
          </summary>
          <div className="mt-6 space-y-10 pb-4">
            {domainSections.map(({ domain, rows }) => (
              <section key={domain}>
                <h3 className="border-b border-stone-200 pb-2 text-base font-medium">
                  {DOMAIN_LABELS[domain]}
                  <span className="ml-2 text-sm font-normal text-stone-500">
                    {rows.filter((r) => r.ws).length}/{rows.length}
                  </span>
                </h3>
                <ul className="mt-4 space-y-3">
                  {rows.map(({ t, ws, level }) => (
                    <TopicRow
                      key={t.code}
                      tenant={tenant}
                      domain={domain}
                      t={t}
                      ws={ws}
                      starter={starter}
                      level={level}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </details>
      </main>
    </>
  );
}
