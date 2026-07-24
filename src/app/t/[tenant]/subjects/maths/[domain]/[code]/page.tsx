import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionAccount, requireSession } from "@/lib/auth";
import { getAnswerKey, getWorksheet } from "@/lib/content";
import { getChildTopicInsights } from "@/lib/family-progress";
import { isParentAccount } from "@/lib/accounts";
import { getTopicProgressState } from "@/lib/progress";
import { formatLevel } from "@/lib/practice-rating";
import {
  mathsLearnTopicHref,
  mathsPracticeHref,
  mathsTopicHref,
} from "@/lib/paths";
import { getTopicLearnGuide } from "@/lib/learn";
import { primaryTopicLabel } from "@/lib/topic-labels";
import { isGcseDomain } from "@/lib/subjects";
import { isTenantId } from "@/lib/tenants";
import { topicByCode } from "@/lib/topics/catalog";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { FamilyTopicPanel } from "@/components/FamilyTopicPanel";
import { mathsTopicTrail } from "@/lib/nav-crumbs";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function MathsTopicPage({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant) || !isGcseDomain(domain)) notFound();
  const session = await requireSession(tenant);
  const account = await getSessionAccount();

  const slug = `${domain}/${code}`;
  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const answerKey = await getAnswerKey(tenant, slug);
  const state = await getTopicProgressState(session.userId, "maths", slug);
  const familyInsights =
    account && isParentAccount(account)
      ? await getChildTopicInsights(account, "maths", slug)
      : [];

  const baseHref = mathsTopicHref(tenant, domain, code);
  const topicMeta = topicByCode(doc.frontmatter.topic);
  const headline = topicMeta
    ? await primaryTopicLabel(tenant, topicMeta)
    : doc.frontmatter.title;

  const learnGuide = await getTopicLearnGuide(tenant, domain, code);

  return (
    <>
      <ServerTenantNav
        tenantId={tenant}
        crumbs={mathsTopicTrail(tenant, domain, headline, baseHref)}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">{headline}</h1>
        {headline !== doc.frontmatter.title ? (
          <p className="mt-1 text-sm text-stone-500">{doc.frontmatter.title}</p>
        ) : null}

        <p className="mt-4 rounded-lg bg-stone-100 px-4 py-3 text-sm text-stone-700">
          Your level on this topic{" "}
          <span className="text-lg font-semibold tabular-nums text-stone-900">
            {formatLevel(state.rating)}
          </span>
        </p>

        <FamilyTopicPanel insights={familyInsights} />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={mathsPracticeHref(tenant, domain, code)}
            className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Go
          </Link>
          {learnGuide ? (
            <Link
              href={mathsLearnTopicHref(tenant, domain, code)}
              className="rounded-lg border border-violet-300 bg-violet-50 px-5 py-2.5 text-sm font-medium text-violet-950"
            >
              Learn this topic
            </Link>
          ) : null}
        </div>

        {!answerKey ? (
          <p className="mt-4 text-sm text-amber-800">
            Questions are not ready for this topic yet.
          </p>
        ) : null}
      </main>
    </>
  );
}
