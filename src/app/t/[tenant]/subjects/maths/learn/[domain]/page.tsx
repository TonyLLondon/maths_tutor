import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getDomainLearnHub } from "@/lib/learn";
import { DOMAIN_LABELS, isGcseDomain } from "@/lib/subjects";
import { isTenantId } from "@/lib/tenants";
import { topicByCode, TOPICS } from "@/lib/topics/catalog";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { LearnArticleBody } from "@/components/LearnArticleBody";
import {
  mathsLearnHubHref,
  mathsLearnTopicHref,
} from "@/lib/paths";

type Props = { params: Promise<{ tenant: string; domain: string }> };

export default async function LearnDomainPage({ params }: Props) {
  const { tenant, domain: domainParam } = await params;
  if (!isTenantId(tenant) || !isGcseDomain(domainParam)) notFound();
  await requireSession(tenant);

  const hub = await getDomainLearnHub(tenant, domainParam);
  if (!hub) notFound();

  const topics = TOPICS.filter((t) => t.domain === domainParam);

  return (
    <>
      <ServerTenantNav
        tenantId={tenant}
        crumbs={[
          { label: "Subjects", href: `/t/${tenant}/subjects` },
          { label: "Maths", href: `/t/${tenant}/subjects/maths` },
          { label: "Learn", href: mathsLearnHubHref(tenant) },
          { label: DOMAIN_LABELS[domainParam] },
        ]}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">{hub.frontmatter.title}</h1>
        <LearnArticleBody tenantId={tenant} body={hub.body} className="mt-6" />
        <section className="mt-10 border-t border-stone-200 pt-8">
          <h2 className="text-lg font-medium text-stone-900">Topic guides</h2>
          <ul className="mt-4 space-y-2">
            {topics.map((t) => {
              const meta = topicByCode(t.code);
              return (
                <li key={t.code}>
                  <Link
                    href={mathsLearnTopicHref(tenant, domainParam, t.code)}
                    className="font-medium text-sky-800 underline decoration-sky-300 underline-offset-2"
                  >
                    {meta?.title ?? t.title}
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
