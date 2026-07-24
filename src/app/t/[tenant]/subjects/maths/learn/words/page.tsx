import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { listGlossarySlugs } from "@/lib/learn";
import { isTenantId } from "@/lib/tenants";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { mathsLearnHubHref, mathsLearnWordHref } from "@/lib/paths";

type Props = { params: Promise<{ tenant: string }> };

export default async function LearnWordsPage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);

  const slugs = await listGlossarySlugs(tenant);

  return (
    <>
      <ServerTenantNav
        tenantId={tenant}
        crumbs={[
          { label: "Subjects", href: `/t/${tenant}/subjects` },
          { label: "Maths", href: `/t/${tenant}/subjects/maths` },
          { label: "Learn", href: mathsLearnHubHref(tenant) },
          { label: "Maths words" },
        ]}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">Maths words</h1>
        <p className="mt-2 text-stone-600">
          Short meanings and examples. Tap a word to read more.
        </p>
        <ul className="mt-8 columns-1 gap-x-8 sm:columns-2">
          {slugs.map((slug) => (
            <li key={slug} className="mb-2 break-inside-avoid">
              <Link
                href={mathsLearnWordHref(tenant, slug)}
                className="font-medium text-sky-800 underline decoration-sky-300 underline-offset-2 capitalize"
              >
                {slug.replace(/-/g, " ")}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
