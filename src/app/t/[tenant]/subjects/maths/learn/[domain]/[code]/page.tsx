import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getTopicLearnGuide, getTopicLearnMeta } from "@/lib/learn";
import { DOMAIN_LABELS, isGcseDomain } from "@/lib/subjects";
import { isTenantId } from "@/lib/tenants";
import { topicByCode } from "@/lib/topics/catalog";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { LearnArticleBody } from "@/components/LearnArticleBody";
import {
  mathsLearnDomainHref,
  mathsLearnHubHref,
  mathsLearnWordHref,
  mathsPracticeHref,
  mathsTopicHref,
} from "@/lib/paths";
import { primaryTopicLabel } from "@/lib/topic-labels";

type Props = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export default async function LearnTopicPage({ params }: Props) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant) || !isGcseDomain(domain)) notFound();
  await requireSession(tenant);

  const guide = await getTopicLearnGuide(tenant, domain, code);
  if (!guide) notFound();

  const meta = await getTopicLearnMeta(tenant, domain, code);
  const spineTopic = topicByCode(code);
  const headline = spineTopic
    ? await primaryTopicLabel(tenant, spineTopic)
    : guide.frontmatter.title;

  return (
    <>
      <ServerTenantNav
        tenantId={tenant}
        crumbs={[
          { label: "Subjects", href: `/t/${tenant}/subjects` },
          { label: "Maths", href: `/t/${tenant}/subjects/maths` },
          { label: "Learn", href: mathsLearnHubHref(tenant) },
          { label: DOMAIN_LABELS[domain], href: mathsLearnDomainHref(tenant, domain) },
          { label: headline },
        ]}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">{headline}</h1>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={mathsPracticeHref(tenant, domain, code)}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
          >
            Practise this topic
          </Link>
          <Link
            href={mathsTopicHref(tenant, domain, code)}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800"
          >
            Topic home
          </Link>
        </div>
        <LearnArticleBody tenantId={tenant} body={guide.body} className="mt-8" />
        {meta?.glossaryTerms && meta.glossaryTerms.length > 0 ? (
          <section className="mt-10 rounded-lg border border-stone-200 bg-stone-50 px-4 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-600">
              Words for this topic
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {meta.glossaryTerms.map((slug) => (
                <li key={slug}>
                  <Link
                    href={mathsLearnWordHref(tenant, slug)}
                    className="rounded-full bg-white px-3 py-1 text-sm font-medium text-sky-900 ring-1 ring-stone-200"
                  >
                    {slug.replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}
