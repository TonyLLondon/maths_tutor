import { DEFAULT_TOPIC_RATING } from "./practice-rating";
import { kvDel, kvGet, kvMGet, kvSet } from "./kv";

export type QuestionAttempt = {
  correct: boolean;
  attempts: number;
  lastAnswer: string;
  updatedAt: string;
};

export type RatingSnapshot = {
  rating: number;
  at: string;
};

export type TopicProgressState = {
  rating: number;
  ratingHistory?: RatingSnapshot[];
  questions: Record<string, QuestionAttempt>;
};

export type TopicProgress = Record<string, QuestionAttempt>;

const HISTORY_CAP = 120;

function isLegacyProgress(
  data: unknown,
): data is Record<string, QuestionAttempt> {
  if (!data || typeof data !== "object") return false;
  const keys = Object.keys(data);
  if (keys.length === 0) return true;
  const first = (data as Record<string, unknown>)[keys[0]];
  return (
    typeof first === "object" &&
    first !== null &&
    "correct" in first &&
    !("questions" in data)
  );
}

function normalizeProgress(data: unknown): TopicProgressState {
  if (!data) {
    return { rating: DEFAULT_TOPIC_RATING, questions: {} };
  }
  if (isLegacyProgress(data)) {
    return { rating: DEFAULT_TOPIC_RATING, questions: data };
  }
  const state = data as TopicProgressState;
  const questions = state.questions ?? {};
  let rating = state.rating ?? DEFAULT_TOPIC_RATING;
  if (
    Object.keys(questions).length === 0 &&
    rating === 1200
  ) {
    rating = DEFAULT_TOPIC_RATING;
  }
  return {
    rating,
    ratingHistory: state.ratingHistory,
    questions,
  };
}

export function progressKey(
  userId: string,
  subject: string,
  topicPath: string,
): string {
  return `mt:user:${userId}:progress:${subject}:${topicPath}`;
}

/** Batch-fetch topic levels for maths domain lists (single KV mget). */
export async function getTopicRatingsBatch(
  userId: string,
  subject: string,
  topicPaths: string[],
): Promise<Map<string, number>> {
  if (topicPaths.length === 0) return new Map();
  const keys = topicPaths.map((p) => progressKey(userId, subject, p));
  const rows = await kvMGet<unknown>(keys);
  const out = new Map<string, number>();
  topicPaths.forEach((path, i) => {
    out.set(path, normalizeProgress(rows[i]).rating);
  });
  return out;
}

export async function getTopicProgressState(
  userId: string,
  subject: string,
  topicPath: string,
): Promise<TopicProgressState> {
  const key = progressKey(userId, subject, topicPath);
  const data = await kvGet<unknown>(key);
  const state = normalizeProgress(data);
  if (data != null && isLegacyProgress(data)) {
    await kvSet(key, state);
  } else if (
    data != null &&
    !isLegacyProgress(data) &&
    Object.keys(state.questions).length === 0 &&
    (data as TopicProgressState).rating === 1200 &&
    state.rating === DEFAULT_TOPIC_RATING
  ) {
    await kvSet(key, state);
  }
  return state;
}

/** Flat question map (legacy callers). */
export async function getTopicProgress(
  userId: string,
  subject: string,
  topicPath: string,
): Promise<TopicProgress> {
  const state = await getTopicProgressState(userId, subject, topicPath);
  return state.questions;
}

export async function saveTopicProgressState(
  userId: string,
  subject: string,
  topicPath: string,
  state: TopicProgressState,
): Promise<void> {
  await kvSet(progressKey(userId, subject, topicPath), state);
}

export async function saveQuestionAttempt(
  userId: string,
  subject: string,
  topicPath: string,
  questionId: string,
  attempt: QuestionAttempt,
  ratingAfter?: number,
  priorState?: TopicProgressState,
): Promise<TopicProgressState> {
  const key = progressKey(userId, subject, topicPath);
  const state =
    priorState ?? normalizeProgress(await kvGet<unknown>(key));
  state.questions[questionId] = attempt;
  if (ratingAfter != null) {
    state.rating = ratingAfter;
    const snap: RatingSnapshot = {
      rating: ratingAfter,
      at: new Date().toISOString(),
    };
    state.ratingHistory = [...(state.ratingHistory ?? []), snap].slice(
      -HISTORY_CAP,
    );
  }
  await kvSet(key, state);
  return state;
}

export async function clearTopicProgress(
  userId: string,
  subject: string,
  topicPath: string,
): Promise<void> {
  await kvDel(progressKey(userId, subject, topicPath));
}
