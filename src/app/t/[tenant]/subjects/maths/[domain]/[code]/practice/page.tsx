import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getAnswerKey, getQuestionFigures, getWorksheet } from "@/lib/content";
import { getTopicProgressState } from "@/lib/progress";
import { parseQuestions, toPracticeClientMeta } from "@/lib/questions";
import { DOMAIN_LABELS, isGcseDomain, topicByCode } from "@/lib/subjects";
import { isTenantId } from "@/lib/tenants";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { QuestionPractice } from "@/components/QuestionPractice";
import { mathsTopicTrail } from "@/lib/nav-crumbs";
import { mathsTopicHref } from "@/lib/paths";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function PracticePage({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant) || !isGcseDomain(domain)) notFound();
  const session = await requireSession(tenant);

  const slug = `${domain}/${code}`;
  const [doc, answerKey, progressState, figuresFile] = await Promise.all([
    getWorksheet(tenant, slug),
    getAnswerKey(tenant, slug),
    getTopicProgressState(session.userId, "maths", slug),
    getQuestionFigures(tenant, slug),
  ]);
  if (!doc) notFound();

  const questions = parseQuestions(doc.body);
  const answerMeta: Record<
    string,
    ReturnType<typeof toPracticeClientMeta>
  > = {};
  if (answerKey) {
    for (const q of questions) {
      const entry = answerKey.answers[q.id];
      if (entry) {
        answerMeta[q.id] = toPracticeClientMeta(entry, q.id, q.tier);
      }
    }
  }

  const topicHref = mathsTopicHref(tenant, domain, code);
  const spine = topicByCode(code);

  const figures = figuresFile?.figures ?? {};

  return (
    <>
      <ServerTenantNav
        tenantId={tenant}
        crumbs={mathsTopicTrail(
          tenant,
          domain,
          doc.frontmatter.title,
          topicHref,
          "Practice",
        )}
      />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <QuestionPractice
          tenant={tenant}
          domain={domain}
          code={code}
          title={doc.frontmatter.title}
          domainLabel={DOMAIN_LABELS[domain]}
          topicSummary={spine?.summary}
          questions={questions}
          answerMeta={answerMeta}
          figures={figures}
          initialRating={progressState.rating}
          initialProgress={progressState.questions}
        />
      </main>
    </>
  );
}
