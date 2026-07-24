import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { resolveWatchedChildren } from "@/lib/accounts";
import { requireParentAccount } from "@/lib/family-access";
import { getWorksheet } from "@/lib/content";
import { loadFamilyMathsForChild } from "@/lib/family-progress";
import {
  DOMAIN_LABELS,
  MATHS_DOMAINS,
  topicsByDomain,
} from "@/lib/subjects";
import { primaryTopicLabelWithStarter } from "@/lib/topic-labels";
import { loadStarterTopics } from "@/lib/starter-topics";
import { isTenantId } from "@/lib/tenants";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { LevelTrendBadge } from "@/components/LevelTrendBadge";
import { familySubjectTrail } from "@/lib/nav-crumbs";
import { familyHubHref, mathsDomainHref, mathsTopicHref } from "@/lib/paths";

type Props = { params: Promise<{ tenant: string }> };

export default async function FamilyMathsPage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  const account = await requireParentAccount(tenant);
  const children = await resolveWatchedChildren(account);
  const starter = await loadStarterTopics(tenant);
  const starterKeys = new Set(starter.map((s) => `${s.domain}/${s.code}`));

  const entries: {
    domain: string;
    code: string;
    label: string;
    isStarter: boolean;
  }[] = [];
  for (const domain of MATHS_DOMAINS) {
    for (const t of topicsByDomain(domain)) {
      const slug = `${domain}/${t.code}`;
      const ws = await getWorksheet(tenant, slug);
      if (!ws) continue;
      const label = primaryTopicLabelWithStarter(starter, t);
      entries.push({
        domain,
        code: t.code,
        label,
        isStarter: starterKeys.has(slug),
      });
    }
  }

  const byChild = await Promise.all(
    children.map(async (child) => ({
      child,
      rows: await loadFamilyMathsForChild(child, entries),
    })),
  );

  return (
    <>
      <ServerTenantNav
        tenantId={tenant}
        crumbs={familySubjectTrail(tenant, "Maths")}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">Maths</h1>
        <p className="mt-2 text-stone-600">
          Each child separately — level, trend over the last week, and topics
          that have gone quiet.
        </p>
        <p className="mt-4">
          <Link
            href={familyHubHref(tenant)}
            className="text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-2 hover:text-stone-900"
          >
            Back to family home
          </Link>
        </p>

        <div className="mt-10 space-y-12">
          {byChild.map(({ child, rows }) => {
            const nudge = rows.filter(
              (r) => r.isStarter && r.insight.isQuiet,
            );
            const grouped = MATHS_DOMAINS.map((domain) => ({
              domain,
              rows: rows.filter((r) => r.domain === domain),
            })).filter((g) => g.rows.length > 0);

            return (
              <section
                key={child.id}
                className="rounded-xl border border-stone-200 bg-white px-5 py-6"
              >
                <h2 className="text-lg font-semibold text-stone-900">
                  {child.displayName}
                </h2>

                {nudge.length > 0 ? (
                  <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3">
                    <h3 className="text-sm font-semibold text-amber-950">
                      Might need a nudge
                    </h3>
                    <p className="mt-1 text-xs text-amber-900/80">
                      Start-here topics with no practice in the last week.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {nudge.map((row) => (
                        <li key={row.slug}>
                          <Link
                            href={mathsTopicHref(tenant, row.domain, row.code)}
                            className="text-sm font-medium text-amber-950 underline decoration-amber-300 underline-offset-2 hover:text-amber-900"
                          >
                            {row.label}
                          </Link>
                          <span className="ml-2 text-xs text-amber-800">
                            {row.insight.lastPracticedLabel}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="px-2 py-2 font-medium text-stone-800">
                          Topic
                        </th>
                        <th className="px-2 py-2 font-medium text-stone-800">
                          Level
                        </th>
                        <th className="px-2 py-2 font-medium text-stone-800">
                          Trend
                        </th>
                        <th className="px-2 py-2 font-medium text-stone-800">
                          Last practice
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map(({ domain, rows: domainRows }) => (
                        <Fragment key={domain}>
                          <tr className="border-b border-stone-100 bg-stone-50">
                            <td
                              colSpan={4}
                              className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-stone-600"
                            >
                              <Link
                                href={mathsDomainHref(tenant, domain)}
                                className="hover:underline"
                              >
                                {DOMAIN_LABELS[domain]}
                              </Link>
                            </td>
                          </tr>
                          {domainRows.map((row) => (
                            <tr
                              key={row.slug}
                              className="border-b border-stone-50"
                            >
                              <td className="px-2 py-2.5 pl-4">
                                <Link
                                  href={mathsTopicHref(
                                    tenant,
                                    row.domain,
                                    row.code,
                                  )}
                                  className="font-medium text-stone-900 hover:underline"
                                >
                                  {row.label}
                                </Link>
                              </td>
                              <td className="px-2 py-2.5 tabular-nums text-stone-800">
                                {row.insight.levelLabel}
                              </td>
                              <td className="px-2 py-2.5">
                                <LevelTrendBadge
                                  label={row.insight.trendLabel}
                                  trend={row.insight.trend}
                                />
                              </td>
                              <td className="px-2 py-2.5 text-stone-600">
                                {row.insight.lastPracticedLabel}
                                {row.insight.isQuiet &&
                                !row.isStarter ? (
                                  <span className="ml-1 text-xs text-stone-400">
                                    · quiet
                                  </span>
                                ) : null}
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
