import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getGlossaryTerm } from "@/lib/learn";
import { isTenantId } from "@/lib/tenants";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { LearnArticleBody } from "@/components/LearnArticleBody";
import { mathsLearnHubHref, mathsLearnWordsHref } from "@/lib/paths";

type Props = { params: Promise<{ tenant: string; slug: string }> };

export default async function LearnWordPage({ params }: Props) {
  const { tenant, slug } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);

  const term = await getGlossaryTerm(tenant, slug);
  if (!term) notFound();

  return (
    <>
      <ServerTenantNav
        tenantId={tenant}
        crumbs={[
          { label: "Subjects", href: `/t/${tenant}/subjects` },
          { label: "Maths", href: `/t/${tenant}/subjects/maths` },
          { label: "Learn", href: mathsLearnHubHref(tenant) },
          { label: "Maths words", href: mathsLearnWordsHref(tenant) },
          { label: term.frontmatter.title },
        ]}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">{term.frontmatter.title}</h1>
        <LearnArticleBody tenantId={tenant} body={term.body} className="mt-6" />
        <p className="mt-8">
          <Link
            href={mathsLearnWordsHref(tenant)}
            className="text-sm font-medium text-sky-800 underline decoration-sky-300 underline-offset-2"
          >
            Back to all words
          </Link>
        </p>
      </main>
    </>
  );
}
