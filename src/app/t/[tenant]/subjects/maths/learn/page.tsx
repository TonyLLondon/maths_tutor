import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { DOMAIN_LABELS, MATHS_DOMAINS } from "@/lib/subjects";
import { isTenantId } from "@/lib/tenants";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { mathsLearnDomainHref, mathsLearnHubHref, mathsLearnWordsHref } from "@/lib/paths";

type Props = { params: Promise<{ tenant: string }> };

export default async function LearnHubPage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);

  return (
    <>
      <ServerTenantNav
        tenantId={tenant}
        crumbs={[
          { label: "Subjects", href: `/t/${tenant}/subjects` },
          { label: "Maths", href: `/t/${tenant}/subjects/maths` },
          { label: "Learn" },
        ]}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">Learn maths</h1>
        <p className="mt-2 text-stone-600">
          Short guides and word meanings. Read a topic before you practise, or tap a
          word when Help points you here.
        </p>
        <p className="mt-4">
          <Link
            href={mathsLearnWordsHref(tenant)}
            className="text-sm font-medium text-sky-800 underline decoration-sky-300 underline-offset-2"
          >
            Maths words A–Z
          </Link>
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {MATHS_DOMAINS.map((domain) => (
            <li key={domain}>
              <Link
                href={mathsLearnDomainHref(tenant, domain)}
                className="block rounded-xl border border-stone-200 bg-white p-5 hover:border-stone-400"
              >
                <h2 className="font-semibold text-stone-900">{DOMAIN_LABELS[domain]}</h2>
                <p className="mt-1 text-sm text-stone-600">Topic guides for this area</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-stone-500">
          <Link href={mathsLearnHubHref(tenant)} className="sr-only">
            Learn hub
          </Link>
          When you are practising, use <strong>Help</strong> on a question for steps,
          or open the topic guide for the big picture.
        </p>
      </main>
    </>
  );
}
