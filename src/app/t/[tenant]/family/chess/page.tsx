import Link from "next/link";
import { notFound } from "next/navigation";
import { requireParentAccount } from "@/lib/family-access";
import { getChildChessInsights } from "@/lib/family-progress";
import { isTenantId } from "@/lib/tenants";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { familySubjectTrail } from "@/lib/nav-crumbs";
import { familyHubHref } from "@/lib/paths";

type Props = { params: Promise<{ tenant: string }> };

export default async function FamilyChessPage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  const account = await requireParentAccount(tenant);
  const children = await getChildChessInsights(account);

  return (
    <>
      <ServerTenantNav
        tenantId={tenant}
        crumbs={familySubjectTrail(tenant, "Chess")}
      />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">Chess</h1>
        <p className="mt-2 text-stone-600">
          Opening trainer results for each child.
        </p>
        <p className="mt-4">
          <Link
            href={familyHubHref(tenant)}
            className="text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-2 hover:text-stone-900"
          >
            Back to family home
          </Link>
        </p>

        <ul className="mt-8 space-y-6">
          {children.map((child) => (
            <li
              key={child.userId}
              className="rounded-xl border border-stone-200 bg-white px-5 py-5"
            >
              <h2 className="text-lg font-semibold text-stone-900">
                {child.displayName}
              </h2>
              {child.gamesPlayed === 0 && !child.summaryLine ? (
                <p className="mt-3 text-sm text-stone-600">Not played yet.</p>
              ) : (
                <>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Best score
                      </dt>
                      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-stone-900">
                        {child.bestScore}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Last score
                      </dt>
                      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-stone-900">
                        {child.lastScore}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Games played
                      </dt>
                      <dd className="mt-0.5 font-medium text-stone-900">
                        {child.gamesPlayed}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Last played
                      </dt>
                      <dd className="mt-0.5 font-medium text-stone-900">
                        {child.lastPlayedLabel}
                      </dd>
                    </div>
                    {child.playStreakDays > 1 ? (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                          Play streak
                        </dt>
                        <dd className="mt-0.5 font-medium text-stone-900">
                          {child.playStreakDays} days
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  {child.trickySpots.length > 0 ? (
                    <div className="mt-5 border-t border-stone-100 pt-4">
                      <h3 className="text-sm font-medium text-stone-800">
                        Tricky opening steps
                      </h3>
                      <p className="mt-1 text-xs text-stone-500">
                        Lines where wrong moves come up often in the trainer.
                      </p>
                      <ul className="mt-2 space-y-2 text-sm text-stone-600">
                        {child.trickySpots.map((spot, i) => (
                          <li key={i}>{spot.label}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {child.openings.length > 0 ? (
                    <div className="mt-5 border-t border-stone-100 pt-4">
                      <h3 className="text-sm font-medium text-stone-800">
                        Openings reached
                      </h3>
                      <ul className="mt-2 space-y-1.5 text-sm text-stone-600">
                        {child.openings.map((o) => (
                          <li key={o.name} className="flex justify-between gap-4">
                            <span>{o.name}</span>
                            <span className="shrink-0 tabular-nums text-stone-500">
                              {o.timesReached === 1
                                ? "once"
                                : `${o.timesReached} times`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              )}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
