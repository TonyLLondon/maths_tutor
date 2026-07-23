import type { QuestionTier } from "./questions";

/** GCSE “hard / stretch” anchor on the same scale as chess-style ratings. */
export const GCSE_HARD = 2000;

/** @deprecated prefer GCSE_HARD */
export const GCSE_HARD_RATING = GCSE_HARD;

/** Youngest learners (≈ age 7). */
export const MIN_QUESTION_RATING = 500;

/** New topic starting point (≈ age 7). */
export const DEFAULT_TOPIC_RATING = MIN_QUESTION_RATING;

/** Target question count per spine topic (adaptive pool at each level). */
export const TARGET_QUESTIONS_PER_TOPIC = 200;

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
  sessionIds: string[];
};

/** Pick a question near the learner’s level; same questions can repeat across sessions. */
export function pickNextQuestionId(opts: PickNextOptions): string | null {
  const { questionIds, ratingById, userRating, sessionIds } = opts;
  if (questionIds.length === 0) return null;

  const sessionSet = new Set(sessionIds);
  const candidates = questionIds.filter((id) => ratingById[id] != null);
  if (candidates.length === 0) return questionIds[0] ?? null;

  const scored = candidates.map((id) => {
    const qRating = ratingById[id]!;
    const distance = Math.abs(qRating - userRating);
    const repeatPenalty = sessionSet.has(id) ? 120 : 0;
    return {
      id,
      sortKey: distance + repeatPenalty + Math.random() * 8,
    };
  });

  scored.sort((a, b) => a.sortKey - b.sortKey);
  return scored[0]?.id ?? null;
}

export function formatLevel(rating: number): string {
  return rating.toLocaleString("en-GB");
}
