import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getAnswerKey, getQuestionSupport, getWorksheet } from "@/lib/content";
import type { ClientQuestionSupport } from "@/lib/question-support";
import { parseQuestions, toClientAnswerMeta } from "@/lib/questions";
import { isTenantId } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { QuestionPractice } from "@/components/QuestionPractice";
import { mathsTopicTrail } from "@/lib/nav-crumbs";
import { mathsTopicHref } from "@/lib/paths";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function PracticePage({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant)) notFound();
  const session = await requireSession(tenant);

  const slug = `${domain}/${code}`;
  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const questions = parseQuestions(doc.body);
  const answerKey = await getAnswerKey(tenant, slug);
  const supportFile = await getQuestionSupport(tenant, slug);
  const answerMeta: Record<string, ReturnType<typeof toClientAnswerMeta>> = {};
  const supportMeta: Record<string, ClientQuestionSupport> = {};
  if (answerKey) {
    for (const q of questions) {
      const entry = answerKey.answers[q.id];
      if (entry) {
        answerMeta[q.id] = toClientAnswerMeta(entry, q.id, q.tier);
      }
    }
  }
  if (supportFile) {
    for (const q of questions) {
      const entry = supportFile.questions[q.id];
      if (entry) supportMeta[q.id] = entry;
    }
  }

  const topicHref = mathsTopicHref(tenant, domain, code);

  return (
    <>
      <TenantNav
        tenantId={tenant}
        userName={session.displayName}
        crumbs={mathsTopicTrail(tenant, doc.frontmatter.title, topicHref)}
      />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
        <QuestionPractice
            tenant={tenant}
            domain={domain}
            code={code}
            title={doc.frontmatter.title}
            questions={questions}
            answerMeta={answerMeta}
            supportMeta={supportMeta}
          />
      </main>
    </>
  );
}
