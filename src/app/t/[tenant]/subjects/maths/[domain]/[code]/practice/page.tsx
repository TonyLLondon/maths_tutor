import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getAnswerKey, getWorksheet } from "@/lib/content";
import { parseQuestions } from "@/lib/questions";
import { isTenantId, TENANTS } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { QuestionPractice } from "@/components/QuestionPractice";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function PracticePage({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);

  const slug = `${domain}/${code}`;
  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const config = TENANTS[tenant];
  const questions = parseQuestions(doc.body);
  const answerKey = await getAnswerKey(tenant, slug);
  const answerIds = answerKey ? Object.keys(answerKey.answers) : [];

  return (
    <>
      <TenantNav tenantId={tenant} tenantName={config.name} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-xl font-semibold text-stone-900">
          Practice · {doc.frontmatter.title}
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          One question at a time. Your results are saved for Archer in KV.
        </p>
        <div className="mt-8">
          <QuestionPractice
            tenant={tenant}
            domain={domain}
            code={code}
            title={doc.frontmatter.title}
            questions={questions}
            answerIds={answerIds}
          />
        </div>
      </main>
    </>
  );
}
