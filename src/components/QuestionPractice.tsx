"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChartAnswer } from "@/components/BarChartAnswer";
import { apiProgressPath, mathsTopicHref } from "@/lib/paths";
import { friendlySectionHeading } from "@/lib/question-display";
import type {
  ClientAnswerMeta,
  ParsedQuestion,
  QuestionTier,
} from "@/lib/questions";

type AttemptState = {
  correct: boolean;
  attempts: number;
  lastAnswer: string;
};

const TIER_LABELS: Record<QuestionTier, string> = {
  1: "Easier",
  2: "Medium",
  3: "Harder",
};

const SESSION_SIZE = 5;

function shuffleIds(ids: string[]): string[] {
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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
  const [tier, setTier] = useState<QuestionTier>(1);
  const [fullSet, setFullSet] = useState(false);
  const [progress, setProgress] = useState<Record<string, AttemptState>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(api)
      .then((res) => (res.ok ? res.json() : { progress: {} }))
      .then((data: { progress?: Record<string, AttemptState> }) => {
        if (cancelled) return;
        setProgress(data.progress ?? {});
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  if (!loaded) {
    return <p className="text-sm text-stone-500">One moment…</p>;
  }

  return (
    <PracticeSession
      key={`${tier}-${fullSet}`}
      tenant={tenant}
      domain={domain}
      code={code}
      title={title}
      questions={questions}
      answerMeta={answerMeta}
      tier={tier}
      fullSet={fullSet}
      progress={progress}
      setProgress={setProgress}
      api={api}
      onTierChange={setTier}
      onFullSetChange={setFullSet}
    />
  );
}

type SessionProps = {
  tenant: string;
  domain: string;
  code: string;
  title: string;
  questions: ParsedQuestion[];
  answerMeta: Record<string, ClientAnswerMeta>;
  tier: QuestionTier;
  fullSet: boolean;
  progress: Record<string, AttemptState>;
  setProgress: React.Dispatch<
    React.SetStateAction<Record<string, AttemptState>>
  >;
  api: string;
  onTierChange: (tier: QuestionTier) => void;
  onFullSetChange: (fullSet: boolean) => void;
};

function PracticeSession({
  tenant,
  domain,
  code,
  title,
  questions,
  answerMeta,
  tier,
  fullSet,
  progress,
  setProgress,
  api,
  onTierChange,
  onFullSetChange,
}: SessionProps) {
  const [index, setIndex] = useState(0);

  const tierQuestions = useMemo(
    () => questions.filter((q) => q.tier === tier),
    [questions, tier],
  );

  const sessionOrder = useMemo(() => {
    const ids = tierQuestions.map((q) => q.id);
    if (fullSet || ids.length <= SESSION_SIZE) return ids;
    return shuffleIds(ids).slice(0, SESSION_SIZE);
  }, [tierQuestions, fullSet]);

  const sessionQuestions = useMemo(
    () =>
      sessionOrder
        .map((id) => tierQuestions.find((q) => q.id === id))
        .filter((q): q is ParsedQuestion => Boolean(q)),
    [sessionOrder, tierQuestions],
  );

  const question = sessionQuestions[index];

  const score = useMemo(() => {
    const ids = new Set(sessionQuestions.map((q) => q.id));
    const correct = Object.entries(progress).filter(
      ([id, p]) => ids.has(id) && p.correct,
    ).length;
    return { correct, total: sessionQuestions.length };
  }, [progress, sessionQuestions]);

  async function postAttempt(body: Record<string, unknown>) {
    if (!question) return;
    const res = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, ...body }),
    });
    const data = (await res.json()) as {
      correct: boolean;
      display: string;
      progress: Record<string, AttemptState>;
    };
    return data;
  }

  if (tierQuestions.length === 0) {
    return (
      <p className="text-sm text-stone-600">
        No {TIER_LABELS[tier].toLowerCase()} questions in this topic yet.
      </p>
    );
  }

  if (!question) {
    return <p className="text-sm text-stone-600">No questions in this topic.</p>;
  }

  const meta = answerMeta[question.id];
  if (!meta) {
    return <p className="text-sm text-stone-600">No questions in this topic.</p>;
  }

  const prevAttempt = progress[question.id];

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Question difficulty"
      >
        {([1, 2, 3] as QuestionTier[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tier === t}
            onClick={() => onTierChange(t)}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              tier === t
                ? "bg-stone-900 text-white"
                : "border border-stone-300 text-stone-700 hover:bg-stone-50"
            }`}
          >
            {TIER_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => onFullSetChange(false)}
          className={`rounded-lg px-3 py-1 text-sm ${
            !fullSet
              ? "bg-stone-200 text-stone-900"
              : "text-stone-600 underline"
          }`}
        >
          {SESSION_SIZE} today
        </button>
        <button
          type="button"
          onClick={() => onFullSetChange(true)}
          className={`rounded-lg px-3 py-1 text-sm ${
            fullSet
              ? "bg-stone-200 text-stone-900"
              : "text-stone-600 underline"
          }`}
        >
          All in this level
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-600">
        <span>
          Question {index + 1} of {sessionQuestions.length}
        </span>
        <span>
          {score.correct} of {score.total} right
        </span>
      </div>

      <QuestionAttempt
        key={question.id}
        question={question}
        meta={meta}
        prevAttempt={prevAttempt}
        postAttempt={postAttempt}
        setProgress={setProgress}
      />

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
          disabled={index >= sessionQuestions.length - 1}
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
  } | void>;
  setProgress: React.Dispatch<
    React.SetStateAction<Record<string, AttemptState>>
  >;
};

function QuestionAttempt({
  question,
  meta,
  prevAttempt,
  postAttempt,
  setProgress,
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

  async function submit(body: Record<string, unknown>) {
    setPending(true);
    try {
      const data = await postAttempt(body);
      if (!data) return;
      setFeedback({ correct: data.correct, display: data.display });
      setProgress(data.progress ?? {});
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
      <p className="text-lg text-stone-900">{question.text}</p>

      {prevAttempt?.correct ? (
        <p className="text-sm font-medium text-green-800">
          You already got this one right.
        </p>
      ) : null}

      {kind === "self-check" ? (
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

      {kind === "bar-chart" && meta.bars ? (
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
            {pending ? "Checking…" : "Check bars"}
          </button>
        </form>
      ) : null}

      {kind === "text" ? (
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
            {pending ? "Checking…" : "Check answer"}
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
    </>
  );
}
