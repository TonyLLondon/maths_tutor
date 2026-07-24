import type { LevelTrend } from "@/lib/family-insights";

const TREND_CLASS: Record<LevelTrend, string> = {
  up: "text-emerald-800 bg-emerald-50",
  flat: "text-stone-700 bg-stone-100",
  down: "text-amber-900 bg-amber-50",
  new: "text-stone-500 bg-stone-50",
};

export function LevelTrendBadge({
  label,
  trend,
}: {
  label: string;
  trend: LevelTrend;
}) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${TREND_CLASS[trend]}`}
    >
      {label}
    </span>
  );
}
