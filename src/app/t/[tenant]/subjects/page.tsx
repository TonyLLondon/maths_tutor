import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getChessTrainerProgress } from "@/lib/chess/chess-progress";
import { SUBJECTS } from "@/lib/subjects";
import { isTenantId } from "@/lib/tenants";
import { TenantNav } from "@/components/TenantNav";
import { ChessSubjectStatsLine } from "@/components/chess/ChessSubjectStatsLine";
import { subjectsHomeTrail } from "@/lib/nav-crumbs";

type Props = { params: Promise<{ tenant: string }> };

export default async function SubjectsPage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  const session = await requireSession(tenant);
  const chessProgress = await getChessTrainerProgress(session.userId);

  return (
    <>
      <TenantNav
        tenantId={tenant}
        userName={session.displayName}
        crumbs={subjectsHomeTrail(tenant)}
      />
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
                {subject.id === "chess" ? (
                  <ChessSubjectStatsLine progress={chessProgress} />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
