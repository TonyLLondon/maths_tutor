import Link from "next/link";
import { notFound } from "next/navigation";
import { requireParentAccount } from "@/lib/family-access";
import { loadChildHomeSummaries } from "@/lib/family-progress";
import { getWorksheet } from "@/lib/content";
import {
  MATHS_DOMAINS,
  SUBJECTS,
  topicsByDomain,
  type SubjectId,
} from "@/lib/subjects";
import { primaryTopicLabelWithStarter } from "@/lib/topic-labels";
import { loadStarterTopics } from "@/lib/starter-topics";
import { isTenantId } from "@/lib/tenants";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { subjectsCrumb } from "@/lib/nav-crumbs";
import { familySubjectHref } from "@/lib/paths";

const FAMILY_SUBJECTS: SubjectId[] = ["maths", "chess"];

type Props = { params: Promise<{ tenant: string }> };

async function worksheetSlugs(tenant: string): Promise<string[]> {
  const slugs: string[] = [];
  for (const domain of MATHS_DOMAINS) {
    for (const t of topicsByDomain(domain)) {
      const slug = `${domain}/${t.code}`;
      if (await getWorksheet(tenant, slug)) slugs.push(slug);
    }
  }
  return slugs;
}

export default async function FamilyHubPage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  const account = await requireParentAccount(tenant);
  const slugs = await worksheetSlugs(tenant);
  const summaries = await loadChildHomeSummaries(account, slugs);

  return (
    <>
      <ServerTenantNav
        tenantId={tenant}
        crumbs={[subjectsCrumb(tenant), { label: "Family progress" }]}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">Family progress</h1>
        <p className="mt-2 text-stone-600">
          A snapshot for each child, then drill into a subject when you want
          detail.
        </p>

        <ul className="mt-8 space-y-8">
          {summaries.map((summary) => (
            <li
              key={summary.userId}
              className="rounded-xl border border-stone-200 bg-white px-5 py-5"
            >
              <h2 className="text-lg font-semibold text-stone-900">
                {summary.displayName}
              </h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Last active
                  </dt>
                  <dd className="mt-0.5 font-medium text-stone-900">
                    {summary.lastActiveLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Maths this week
                  </dt>
                  <dd className="mt-0.5 font-medium text-stone-900">
                    {summary.mathsTopicsThisWeek === 0
                      ? "No topics yet"
                      : `${summary.mathsTopicsThisWeek} topic${summary.mathsTopicsThisWeek === 1 ? "" : "s"}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Chess this week
                  </dt>
                  <dd className="mt-0.5 font-medium text-stone-900">
                    {summary.chessActiveThisWeek
                      ? "Played"
                      : "Not yet this week"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Chess games (total)
                  </dt>
                  <dd className="mt-0.5 font-medium text-stone-900">
                    {summary.chessGamesPlayed}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <section className="mt-12">
          <h2 className="text-lg font-medium text-stone-900">By subject</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {FAMILY_SUBJECTS.map((id) => {
              const meta = SUBJECTS[id];
              return (
                <li key={id}>
                  <Link
                    href={familySubjectHref(tenant, id)}
                    className="block h-full rounded-xl border border-sky-200 bg-sky-50/40 p-6 hover:border-sky-300 hover:bg-sky-50"
                  >
                    <h3 className="text-xl font-semibold text-stone-900">
                      {meta.name}
                    </h3>
                    <p className="mt-2 text-sm text-stone-600">
                      {id === "maths"
                        ? "Levels, trends, and topics that might need a nudge."
                        : "Scores, openings, and tricky opening steps."}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </>
  );
}
