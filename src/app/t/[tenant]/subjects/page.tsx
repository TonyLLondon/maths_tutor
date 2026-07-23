import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { SUBJECTS } from "@/lib/subjects";
import { isTenantId, TENANTS } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";

type Props = { params: Promise<{ tenant: string }> };

export default async function SubjectsPage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  await requireSession(tenant);
  const config = TENANTS[tenant];

  return (
    <>
      <TenantNav tenantId={tenant} tenantName={config.name} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">Subjects</h1>
        <p className="mt-2 text-stone-600">Choose what to study today.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {Object.values(SUBJECTS).map((subject) => (
            <li key={subject.id}>
              <Link
                href={`/t/${tenant}/subjects/${subject.id}`}
                className="block rounded-xl border border-stone-200 bg-white p-6 hover:border-stone-400"
              >
                <h2 className="text-xl font-semibold text-stone-900">
                  {subject.name}
                </h2>
                <p className="mt-2 text-sm text-stone-600">{subject.description}</p>
                <p className="mt-3 text-xs text-stone-500">
                  {subject.seedTopicCount} seed topics
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
