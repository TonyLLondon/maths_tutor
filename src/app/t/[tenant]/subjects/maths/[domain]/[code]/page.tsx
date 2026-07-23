import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getAnswerKey, getWorksheet } from "@/lib/content";
import { parseQuestions } from "@/lib/questions";
import { getTopicProgress } from "@/lib/progress";
import {
  mathsPracticeHref,
  mathsPrintHref,
  mathsTopicHref,
} from "@/lib/paths";
import { topicByCode } from "@/lib/topics/catalog";
import { isTenantId, TENANTS } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function MathsTopicPage({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);

  const slug = `${domain}/${code}`;
  const doc = await getWorksheet(tenant, slug);
  if (!doc) notFound();

  const config = TENANTS[tenant];
  const topic = topicByCode(doc.frontmatter.topic);
  const questions = parseQuestions(doc.body);
  const answerKey = await getAnswerKey(tenant, slug);
  const progress = await getTopicProgress(tenant, "maths", slug);
  const correctCount = Object.values(progress).filter((p) => p.correct).length;
  const baseHref = mathsTopicHref(tenant, domain, code);

  return (
    <>
      <TenantNav tenantId={tenant} tenantName={config.name} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href={`/t/${tenant}/subjects/maths`}
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          ← Maths topics
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-stone-900">
          {doc.frontmatter.title}
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          {doc.frontmatter.topic}
          {topic ? ` · ${topic.title}` : ""}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={mathsPracticeHref(tenant, domain, code)}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
          >
            Practice ({correctCount}/{questions.length} correct in KV)
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
            Answer key file missing — practice grading needs{" "}
            <code className="rounded bg-amber-100 px-1">
              {slug}.answers.json
            </code>
          </p>
        ) : null}
      </main>
    </>
  );
}
