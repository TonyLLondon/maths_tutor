import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getAnswerKey, getWorksheet } from "@/lib/content";
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
  const questionTierById = Object.fromEntries(
    questions.map((q) => [q.id, q.tier]),
  );
  const answerKey = await getAnswerKey(tenant, slug);
  const answerMeta: Record<string, ReturnType<typeof toClientAnswerMeta>> = {};
  if (answerKey) {
    for (const [id, entry] of Object.entries(answerKey.answers)) {
      const sectionTier = questionTierById[id] ?? 2;
      answerMeta[id] = toClientAnswerMeta(entry, id, sectionTier);
    }
  }

  const topicHref = mathsTopicHref(tenant, domain, code);

  return (
    <>
      <TenantNav
        tenantId={tenant}
        userName={session.displayName}
        crumbs={mathsTopicTrail(
          tenant,
          doc.frontmatter.title,
          topicHref,
          "Practice",
        )}
      />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mt-2">
          <QuestionPractice
            tenant={tenant}
            domain={domain}
            code={code}
            title={doc.frontmatter.title}
            questions={questions}
            answerMeta={answerMeta}
          />
        </div>
      </main>
    </>
  );
}
