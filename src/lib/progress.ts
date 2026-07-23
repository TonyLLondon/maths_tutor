import { kvDel, kvGet, kvSet } from "./kv";

export type QuestionAttempt = {
  correct: boolean;
  attempts: number;
  lastAnswer: string;
  updatedAt: string;
};

export type TopicProgress = Record<string, QuestionAttempt>;

export function progressKey(
  tenantId: string,
  subject: string,
  topicPath: string,
): string {
  return `mt:tenant:${tenantId}:progress:${subject}:${topicPath}`;
}

export async function getTopicProgress(
  tenantId: string,
  subject: string,
  topicPath: string,
): Promise<TopicProgress> {
  const data = await kvGet<TopicProgress>(
    progressKey(tenantId, subject, topicPath),
  );
  return data ?? {};
}

export async function saveQuestionAttempt(
  tenantId: string,
  subject: string,
  topicPath: string,
  questionId: string,
  attempt: QuestionAttempt,
): Promise<void> {
  const key = progressKey(tenantId, subject, topicPath);
  const existing = (await kvGet<TopicProgress>(key)) ?? {};
  existing[questionId] = attempt;
  await kvSet(key, existing);
}

export async function clearTopicProgress(
  tenantId: string,
  subject: string,
  topicPath: string,
): Promise<void> {
  await kvDel(progressKey(tenantId, subject, topicPath));
}
