import type { ChildTopicInsight } from "@/lib/family-progress";
import { LevelTrendBadge } from "@/components/LevelTrendBadge";

export function FamilyTopicPanel({
  insights,
  compact,
}: {
  insights: ChildTopicInsight[];
  compact?: boolean;
}) {
  if (insights.length === 0) return null;

  if (compact) {
    return (
      <ul className="mt-2 space-y-1.5">
        {insights.map((c) => (
          <li key={c.userId} className="text-sm text-stone-600">
            <span className="font-medium text-stone-800">{c.displayName}</span>
            {" · "}
            Level{" "}
            <span className="font-semibold tabular-nums text-stone-900">
              {c.levelLabel}
            </span>
            {" · "}
            <LevelTrendBadge label={c.trendLabel} trend={c.trend} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section
      className="mt-6 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-4"
      aria-label="Family progress on this topic"
    >
      <h2 className="text-sm font-semibold text-sky-950">Family on this topic</h2>
      <ul className="mt-3 space-y-3">
        {insights.map((c) => (
          <li
            key={c.userId}
            className="rounded-lg bg-white/90 px-3 py-2.5"
          >
            <p className="font-medium text-stone-900">{c.displayName}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-stone-600">
              <span>
                Level{" "}
                <span className="font-semibold tabular-nums text-stone-900">
                  {c.levelLabel}
                </span>
              </span>
              <LevelTrendBadge label={c.trendLabel} trend={c.trend} />
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Last practice: {c.lastPracticedLabel}
              {c.isQuiet ? " · Quiet lately" : null}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
