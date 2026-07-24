import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionAccount, requireSession } from "@/lib/auth";
import { isParentAccount, resolveWatchedChildren } from "@/lib/accounts";
import { getChessTrainerProgress } from "@/lib/chess/chess-progress";
import { familyHubHref } from "@/lib/paths";
import { SUBJECTS } from "@/lib/subjects";
import { isTenantId } from "@/lib/tenants";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { ChessSubjectStatsLine } from "@/components/chess/ChessSubjectStatsLine";
import { subjectsHomeTrail } from "@/lib/nav-crumbs";

type Props = { params: Promise<{ tenant: string }> };

export default async function SubjectsPage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  const session = await requireSession(tenant);
  const account = await getSessionAccount();
  const parentView = account != null && isParentAccount(account);
  const watchedChildren =
    parentView && account ? await resolveWatchedChildren(account) : [];
  const childNamesLabel = watchedChildren
    .map((c) => c.displayName)
    .join(" and ");
  const chessProgress = await getChessTrainerProgress(session.userId);

  return (
    <>
      <ServerTenantNav tenantId={tenant} crumbs={subjectsHomeTrail(tenant)} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">Subjects</h1>
        <p className="mt-2 text-stone-600">Choose what to study today.</p>
        <ul
          className={`mt-8 grid gap-4 ${parentView ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}
        >
          {parentView ? (
            <li className="sm:col-span-2 lg:col-span-1">
              <Link
                href={familyHubHref(tenant)}
                className="block h-full rounded-xl border border-sky-200 bg-sky-50 p-6 hover:border-sky-300 hover:bg-sky-100/80"
              >
                <h2 className="text-xl font-semibold text-sky-950">
                  Family progress
                </h2>
                <p className="mt-2 text-sm text-sky-900/80">
                  See {childNamesLabel || "your children"}&apos;s progress in
                  maths and chess.
                </p>
              </Link>
            </li>
          ) : null}
          {Object.values(SUBJECTS).map((subject) => (
            <li key={subject.id}>
              <Link
                href={`/t/${tenant}/subjects/${subject.id}`}
                className="block h-full rounded-xl border border-stone-200 bg-white p-6 hover:border-stone-400"
              >
                <h2 className="text-xl font-semibold text-stone-900">
                  {subject.name}
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  {subject.description}
                </p>
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
