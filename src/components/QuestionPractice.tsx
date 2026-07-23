"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChartAnswer } from "@/components/BarChartAnswer";
import { MarkdownBody } from "@/components/MarkdownBody";
import { apiProgressPath, mathsTopicHref } from "@/lib/paths";
import { friendlySectionHeading } from "@/lib/question-display";
import {
  formatLevel,
  pickNextQuestionId,
} from "@/lib/practice-rating";
import type {
  ClientAnswerMeta,
  ParsedQuestion,
} from "@/lib/questions";

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
  answerMeta: Record<string, ClientAnswerMeta>;
};

export function QuestionPractice({
  tenant,
  domain,
  code,
  title,
  questions,
  answerMeta,
}: Props) {
  const api = apiProgressPath(tenant, domain, code);
  const [rating, setRating] = useState(1200);
  const [progress, setProgress] = useState<Record<string, AttemptState>>({});
  const [loaded, setLoaded] = useState(false);
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const ratingById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of questions) {
      const meta = answerMeta[q.id];
      if (meta) map[q.id] = meta.rating;
    }
    return map;
  }, [questions, answerMeta]);

  const mastered = useMemo(
    () =>
      new Set(
        Object.entries(progress)
          .filter(([, p]) => p.correct)
          .map(([id]) => id),
      ),
    [progress],
  );

  const pickNext = useCallback(
    (extraSession: string[], userRating: number) => {
      const ids = questions.map((q) => q.id).filter((id) => answerMeta[id]);
      return pickNextQuestionId({
        questionIds: ids,
        ratingById,
        userRating,
        progressCorrect: mastered,
        sessionIds: extraSession,
      });
    },
    [questions, answerMeta, ratingById, mastered],
  );

  useEffect(() => {
    let cancelled = false;
    void fetch(api)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setProgress(data.progress ?? {});
        setRating(data.rating ?? 1200);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  useEffect(() => {
    if (!loaded || currentId) return;
    const first = pickNext([], rating);
    if (first) setCurrentId(first);
  }, [loaded, currentId, pickNext, rating]);

  const question = currentId
    ? questions.find((q) => q.id === currentId)
    : undefined;
  const meta = currentId ? answerMeta[currentId] : undefined;

  const sessionCorrect = sessionIds.filter((id) => progress[id]?.correct).length;

  function goToNextQuestion() {
    const next = pickNext(sessionIds, rating);
    if (next) {
      setCurrentId(next);
    }
  }

  if (!loaded) {
    return <p className="text-sm text-stone-500">One moment…</p>;
  }

  if (questions.length === 0 || !question || !meta) {
    return <p className="text-sm text-stone-600">No questions in this topic.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-stone-600">
          Your level:{" "}
          <span className="font-semibold text-stone-900">{formatLevel(rating)}</span>
        </p>
        <p className="text-sm text-stone-600">
          {sessionCorrect} right this session
        </p>
      </div>

      <QuestionAttempt
        key={question.id}
        question={question}
        meta={meta}
        prevAttempt={progress[question.id]}
        onAnswered={(data) => {
          setProgress(data.progress ?? {});
          if (data.rating != null) setRating(data.rating);
          setSessionIds((s) =>
            s.includes(question.id) ? s : [...s, question.id],
          );
        }}
        postAttempt={async (body) => {
          const res = await fetch(api, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionId: question.id, ...body }),
          });
          return (await res.json()) as {
            correct: boolean;
            display: string;
            progress: Record<string, AttemptState>;
            rating?: number;
          };
        }}
        onNext={goToNextQuestion}
      />

      <Link
        href={mathsTopicHref(tenant, domain, code)}
        className="inline-block text-sm text-stone-600 underline"
      >
        Back to {title}
      </Link>
    </div>
  );
}

type AttemptProps = {
  question: ParsedQuestion;
  meta: ClientAnswerMeta;
  prevAttempt: AttemptState | undefined;
  postAttempt: (
    body: Record<string, unknown>,
  ) => Promise<{
    correct: boolean;
    display: string;
    progress: Record<string, AttemptState>;
    rating?: number;
  }>;
  onAnswered: (data: {
    progress: Record<string, AttemptState>;
    rating?: number;
  }) => void;
  onNext: () => void;
};

function QuestionAttempt({
  question,
  meta,
  prevAttempt,
  postAttempt,
  onAnswered,
  onNext,
}: AttemptProps) {
  const kind = meta.kind ?? "text";
  const [answer, setAnswer] = useState("");
  const [barHeights, setBarHeights] = useState<number[]>(() =>
    meta.bars ? meta.bars.heights.map(() => 0) : [],
  );
  const [showSelfCheckAnswer, setShowSelfCheckAnswer] = useState(false);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    display: string;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const answered = feedback !== null;

  async function submit(body: Record<string, unknown>) {
    setPending(true);
    try {
      const data = await postAttempt(body);
      setFeedback({ correct: data.correct, display: data.display });
      onAnswered({ progress: data.progress, rating: data.rating });
    } finally {
      setPending(false);
    }
  }

  async function submitText(e: React.FormEvent) {
    e.preventDefault();
    await submit({ answer });
  }

  return (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        {friendlySectionHeading(question.section)}
      </p>
      <MarkdownBody
        markdown={question.text}
        className="worksheet-markdown text-lg text-stone-900"
      />

      {prevAttempt?.correct && !answered ? (
        <p className="text-sm font-medium text-green-800">
          You already got this one right before.
        </p>
      ) : null}

      {kind === "self-check" && !answered ? (
        <div className="space-y-3">
          <p className="text-sm text-stone-600">
            Work it out on paper or in your head, then check yourself.
          </p>
          {!showSelfCheckAnswer ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => setShowSelfCheckAnswer(true)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
            >
              Show answer
            </button>
          ) : (
            <>
              <p className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-800">
                {meta.display}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void submit({ selfCheckCorrect: true })}
                  className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
                >
                  I got it right
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void submit({ selfCheckCorrect: false })}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm"
                >
                  Not yet
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}

      {kind === "bar-chart" && meta.bars && !answered ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit({ barHeights });
          }}
          className="space-y-3"
        >
          <BarChartAnswer
            spec={meta.bars}
            values={
              barHeights.length === meta.bars.heights.length
                ? barHeights
                : meta.bars.heights.map(() => 0)
            }
            onChange={setBarHeights}
            disabled={pending}
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
          >
            {pending ? "…" : "Go"}
          </button>
        </form>
      ) : null}

      {kind === "text" && !answered ? (
        <form onSubmit={(e) => void submitText(e)} className="space-y-3">
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
            {pending ? "…" : "Go"}
          </button>
        </form>
      ) : null}

      {feedback && kind !== "self-check" ? (
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

      {feedback && kind === "self-check" ? (
        <p
          className={`text-sm font-medium ${
            feedback.correct ? "text-green-800" : "text-stone-700"
          }`}
        >
          {feedback.correct ? "Nice — marked as correct." : "Keep trying."}
        </p>
      ) : null}

      {answered ? (
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Next question
        </button>
      ) : null}
    </>
  );
}
