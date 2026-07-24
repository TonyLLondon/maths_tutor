import type { RatingSnapshot, TopicProgressState } from "./progress";

export type LevelTrend = "up" | "flat" | "down" | "new";

export type LevelTrendInfo = {
  trend: LevelTrend;
  label: string;
};

const TREND_DELTA = 20;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const QUIET_TOPIC_DAYS = 7;

export function formatLastPracticed(iso: string | null): string {
  if (!iso) return "Not started yet";
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "Not started yet";
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfThen = new Date(
    then.getFullYear(),
    then.getMonth(),
    then.getDate(),
  ).getTime();
  const dayDiff = Math.round((startOfToday - startOfThen) / dayMs);
  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return `${dayDiff} days ago`;
  return then.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function daysSinceIso(iso: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / (24 * 60 * 60 * 1000));
}

export function isQuietTopic(lastPracticedAt: string | null): boolean {
  if (!lastPracticedAt) return true;
  const days = daysSinceIso(lastPracticedAt);
  if (days == null) return true;
  return days > QUIET_TOPIC_DAYS;
}

export function levelTrendFromHistory(
  history: RatingSnapshot[] | undefined,
  currentRating: number,
  hasAttempts: boolean,
): LevelTrendInfo {
  if (!hasAttempts) {
    return { trend: "new", label: "Not started" };
  }
  const snaps = [...(history ?? [])].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
  if (snaps.length < 2) {
    return { trend: "new", label: "Just started" };
  }
  const cutoff = Date.now() - WEEK_MS;
  const beforeWeek = snaps.filter((s) => new Date(s.at).getTime() <= cutoff);
  const baseline =
    beforeWeek.length > 0
      ? beforeWeek[beforeWeek.length - 1].rating
      : snaps[0].rating;
  const delta = currentRating - baseline;
  if (delta >= TREND_DELTA) {
    return { trend: "up", label: "Trending up" };
  }
  if (delta <= -TREND_DELTA) {
    return { trend: "down", label: "Trending down" };
  }
  return { trend: "flat", label: "Holding steady" };
}

export function lastAttemptAt(
  questions: Record<string, { updatedAt?: string }>,
): string | null {
  let latest: string | null = null;
  for (const q of Object.values(questions)) {
    const at = q.updatedAt;
    if (!at) continue;
    if (!latest || at > latest) latest = at;
  }
  return latest;
}

export function attemptsInLastWeek(
  questions: Record<string, { updatedAt?: string }>,
): number {
  const cutoff = Date.now() - WEEK_MS;
  let count = 0;
  for (const q of Object.values(questions)) {
    const at = q.updatedAt;
    if (!at) continue;
    if (new Date(at).getTime() >= cutoff) count += 1;
  }
  return count;
}

export function topicSlugsTouchedThisWeek(
  statesBySlug: Map<string, TopicProgressState>,
): number {
  let count = 0;
  for (const state of statesBySlug.values()) {
    if (Object.keys(state.questions).length === 0) continue;
    const last = lastAttemptAt(state.questions);
    if (!last) continue;
    if (daysSinceIso(last) != null && daysSinceIso(last)! <= QUIET_TOPIC_DAYS) {
      count += 1;
    }
  }
  return count;
}

export function chessActiveThisWeek(lastPlayedDate: string | null): boolean {
  if (!lastPlayedDate) return false;
  const days = daysSinceIso(`${lastPlayedDate}T12:00:00.000Z`);
  return days != null && days <= QUIET_TOPIC_DAYS;
}

export function formatLastActive(
  mathsLast: string | null,
  chessDay: string | null,
): string {
  const candidates: string[] = [];
  if (mathsLast) candidates.push(mathsLast);
  if (chessDay) candidates.push(`${chessDay}T12:00:00.000Z`);
  if (candidates.length === 0) return "Not yet";
  candidates.sort();
  return formatLastPracticed(candidates[candidates.length - 1]);
}
