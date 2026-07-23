import type { QuestionTier } from "./questions";

/** GCSE “hard / stretch” anchor on the same scale as chess-style ratings. */
export const GCSE_HARD_RATING = 2000;

/** New topic starting point (below medium GCSE). */
export const DEFAULT_TOPIC_RATING = 1200;

/** Max rating change per question (kids). */
export const ELO_K = 28;

const TIER_BASE: Record<QuestionTier, number> = {
  1: 1200,
  2: 1600,
  3: GCSE_HARD_RATING,
};

export function ratingFromTier(tier: QuestionTier, questionId: string): number {
  const base = TIER_BASE[tier];
  const n = parseInt(questionId, 10);
  const spread = Number.isFinite(n) ? ((n % 9) - 4) * 12 : 0;
  return Math.min(GCSE_HARD_RATING + 80, Math.max(900, base + spread));
}

export function effectiveQuestionRating(
  stored: number | undefined,
  tier: QuestionTier,
  questionId: string,
): number {
  if (stored != null && stored > 0) return stored;
  return ratingFromTier(tier, questionId);
}

export function expectedScore(userRating: number, questionRating: number): number {
  return 1 / (1 + 10 ** ((questionRating - userRating) / 400));
}

export function nextUserRating(
  userRating: number,
  questionRating: number,
  correct: boolean,
): number {
  const score = correct ? 1 : 0;
  const expected = expectedScore(userRating, questionRating);
  const delta = ELO_K * (score - expected);
  return Math.round(userRating + delta);
}

export type PickNextOptions = {
  questionIds: string[];
  ratingById: Record<string, number>;
  userRating: number;
  progressCorrect: Set<string>;
  sessionIds: string[];
};

/** Pick a question near the learner’s level; prefer not yet mastered. */
export function pickNextQuestionId(opts: PickNextOptions): string | null {
  const { questionIds, ratingById, userRating, progressCorrect, sessionIds } =
    opts;
  if (questionIds.length === 0) return null;

  const sessionSet = new Set(sessionIds);
  const candidates = questionIds.filter((id) => ratingById[id] != null);
  if (candidates.length === 0) return questionIds[0] ?? null;

  const scored = candidates.map((id) => {
    const qRating = ratingById[id]!;
    const distance = Math.abs(qRating - userRating);
    const notMastered = progressCorrect.has(id) ? 1 : 0;
    const repeatPenalty = sessionSet.has(id) ? 120 : 0;
    return {
      id,
      sortKey: notMastered * 500 + distance + repeatPenalty + Math.random() * 8,
    };
  });

  scored.sort((a, b) => a.sortKey - b.sortKey);
  return scored[0]?.id ?? null;
}

export function formatLevel(rating: number): string {
  return rating.toLocaleString("en-GB");
}
