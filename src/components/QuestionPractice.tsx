"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiProgressPath, mathsTopicHref } from "@/lib/paths";
import type { ParsedQuestion } from "@/lib/questions";

type AttemptState = {
  correct: boolean;
  attempts: number;
  lastAnswer: string;
};

type Props = {
  tenant: string;
  domain: string;
  code: string;
  title: string;
  questions: ParsedQuestion[];
  answerIds: string[];
};

export function QuestionPractice({
  tenant,
  domain,
  code,
  title,
  questions,
  answerIds,
}: Props) {
  const api = apiProgressPath(tenant, domain, code);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [progress, setProgress] = useState<Record<string, AttemptState>>({});
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    display: string;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const question = questions[index];
  const hasKey = answerIds.includes(question?.id ?? "");

  const score = useMemo(() => {
    const correct = Object.values(progress).filter((p) => p.correct).length;
    return { correct, total: questions.length };
  }, [progress, questions.length]);

  const loadProgress = useCallback(async () => {
    const res = await fetch(api);
    if (res.ok) {
      const data = (await res.json()) as { progress: Record<string, AttemptState> };
      setProgress(data.progress ?? {});
    }
    setLoaded(true);
  }, [api]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    setAnswer("");
    setFeedback(null);
  }, [index]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!question) return;
    setPending(true);
    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answer }),
      });
      const data = (await res.json()) as {
        correct: boolean;
        display: string;
        progress: Record<string, AttemptState>;
      };
      setFeedback({ correct: data.correct, display: data.display });
      setProgress(data.progress ?? {});
    } finally {
      setPending(false);
    }
  }

  if (!loaded) {
    return <p className="text-sm text-stone-500">Loading progress…</p>;
  }

  if (!question) {
    return <p className="text-sm text-stone-600">No questions in this topic.</p>;
  }

  const prevAttempt = progress[question.id];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-600">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>
          Score: {score.correct}/{score.total} correct
        </span>
      </div>

      <p className="text-xs uppercase tracking-wide text-stone-500">
        {question.section}
      </p>
      <p className="text-lg text-stone-900">{question.text}</p>

      {!hasKey ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Answer key not loaded for this question yet.
        </p>
      ) : null}

      {prevAttempt?.correct ? (
        <p className="text-sm font-medium text-green-800">
          You got this one right earlier.
        </p>
      ) : null}

      <form onSubmit={(e) => void submit(e)} className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">
          Your answer
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none ring-stone-400 focus:ring-2"
        />
        <button
          type="submit"
          disabled={pending || !answer.trim()}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Checking…" : "Check answer"}
        </button>
      </form>

      {feedback ? (
        <div
          className={`rounded-xl border px-4 py-3 ${
            feedback.correct
              ? "border-green-300 bg-green-50"
              : "border-red-300 bg-red-50"
          }`}
        >
          <p
            className={`font-medium ${
              feedback.correct ? "text-green-900" : "text-red-900"
            }`}
          >
            {feedback.correct ? "Correct" : "Not quite"}
          </p>
          <p className="mt-2 text-sm text-stone-800">
            <span className="font-medium">Answer: </span>
            {feedback.display}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={index >= questions.length - 1}
          onClick={() => setIndex((i) => i + 1)}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Next
        </button>
        <Link
          href={mathsTopicHref(tenant, domain, code)}
          className="ml-auto text-sm text-stone-600 underline"
        >
          Back to {title}
        </Link>
      </div>
    </div>
  );
}
