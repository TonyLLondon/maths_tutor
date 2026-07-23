import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getAnswerKey, getWorksheet } from "@/lib/content";
import { parseQuestions } from "@/lib/questions";
import { getTopicProgressState } from "@/lib/progress";
import { formatLevel } from "@/lib/practice-rating";
import {
  mathsPracticeHref,
  mathsPrintHref,
  mathsTopicHref,
} from "@/lib/paths";
import { primaryTopicLabel } from "@/lib/topic-labels";
import { isTenantId } from "@/lib/tenants";
import { topicByCode } from "@/lib/topics/catalog";
import { TenantNav } from "@/components/TenantNav";
import { mathsTopicTrail } from "@/lib/nav-crumbs";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function MathsTopicPage({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant)) notFound();
  const session = await requireSession(tenant);

  const slug = `${domain}/${code}`;
  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const questions = parseQuestions(doc.body);
  const answerKey = await getAnswerKey(tenant, slug);
  const state = await getTopicProgressState(session.userId, "maths", slug);
  const progress = state.questions;
  const correctCount = Object.values(progress).filter((p) => p.correct).length;
  const baseHref = mathsTopicHref(tenant, domain, code);
  const topicMeta = topicByCode(doc.frontmatter.topic);
  const headline = topicMeta
    ? primaryTopicLabel(topicMeta)
    : doc.frontmatter.title;

  return (
    <>
      <TenantNav
        tenantId={tenant}
        userName={session.displayName}
        crumbs={mathsTopicTrail(tenant, headline, baseHref)}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">{headline}</h1>
        {headline !== doc.frontmatter.title ? (
          <p className="mt-1 text-sm text-stone-500">{doc.frontmatter.title}</p>
        ) : null}

        <p className="mt-4 text-sm text-stone-600">
          Your level here:{" "}
          <span className="font-semibold text-stone-900">
            {formatLevel(state.rating)}
          </span>
          {" · "}
          {correctCount}/{questions.length} mastered
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={mathsPracticeHref(tenant, domain, code)}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
          >
            Practice
          </Link>
          <Link
            href={`${baseHref}/worksheet`}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
          >
            Full worksheet
          </Link>
          <Link
            href={mathsPrintHref(tenant, domain, code)}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
          >
            Print
          </Link>
        </div>

        {!answerKey ? (
          <p className="mt-4 text-sm text-amber-800">
            Practice mode is not ready for this topic yet.
          </p>
        ) : null}
      </main>
    </>
  );
}
