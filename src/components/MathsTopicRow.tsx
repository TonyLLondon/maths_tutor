import Link from "next/link";
import type { getWorksheet } from "@/lib/content";
import type { ChildTopicInsight } from "@/lib/family-progress";
import { formatLevel } from "@/lib/practice-rating";
import { mathsTopicHref } from "@/lib/paths";
import type { loadStarterTopics } from "@/lib/starter-topics";
import type { topicsByDomain } from "@/lib/subjects";
import { primaryTopicLabelWithStarter } from "@/lib/topic-labels";
import { FamilyTopicPanel } from "@/components/FamilyTopicPanel";

export type MathsTopicListRow = {
  domain: string;
  t: ReturnType<typeof topicsByDomain>[number];
  ws: Awaited<ReturnType<typeof getWorksheet>>;
  level: number | null;
  familyInsights: ChildTopicInsight[];
};

export function MathsTopicRow({
  tenant,
  domain,
  t,
  ws,
  starter,
  level,
  familyInsights,
}: MathsTopicListRow & {
  tenant: string;
  starter: Awaited<ReturnType<typeof loadStarterTopics>>;
}) {
  const label = primaryTopicLabelWithStarter(starter, t);
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3">
      <div>
        <p
          className={
            ws ? "font-medium text-stone-900" : "font-medium text-stone-400"
          }
        >
          {label}
        </p>
        {label !== t.title ? (
          <p className="mt-0.5 text-xs text-stone-500">{t.title}</p>
        ) : null}
        {ws && level != null ? (
          <p className="mt-1.5 text-sm text-stone-600">
            Your level{" "}
            <span className="font-semibold tabular-nums text-stone-900">
              {formatLevel(level)}
            </span>
          </p>
        ) : null}
        {familyInsights.length > 0 ? (
          <FamilyTopicPanel insights={familyInsights} compact />
        ) : null}
      </div>
      {ws ? (
        <Link
          href={mathsTopicHref(tenant, domain, t.code)}
          className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm text-white"
        >
          Open
        </Link>
      ) : null}
    </li>
  );
}
