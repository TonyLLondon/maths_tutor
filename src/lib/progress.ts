import { kvDel, kvGet, kvSet } from "./kv";

export type QuestionAttempt = {
  correct: boolean;
  attempts: number;
  lastAnswer: string;
  updatedAt: string;
};

export type TopicProgress = Record<string, QuestionAttempt>;

export function progressKey(
  userId: string,
  subject: string,
  topicPath: string,
): string {
  return `mt:user:${userId}:progress:${subject}:${topicPath}`;
}

export async function getTopicProgress(
  userId: string,
  subject: string,
  topicPath: string,
): Promise<TopicProgress> {
  const data = await kvGet<TopicProgress>(
    progressKey(userId, subject, topicPath),
  );
  return data ?? {};
}

export async function saveQuestionAttempt(
  userId: string,
  subject: string,
  topicPath: string,
  questionId: string,
  attempt: QuestionAttempt,
): Promise<void> {
  const key = progressKey(userId, subject, topicPath);
  const existing = (await kvGet<TopicProgress>(key)) ?? {};
  existing[questionId] = attempt;
  await kvSet(key, existing);
}

export async function clearTopicProgress(
  userId: string,
  subject: string,
  topicPath: string,
): Promise<void> {
  await kvDel(progressKey(userId, subject, topicPath));
}
