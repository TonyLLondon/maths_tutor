"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChartAnswer } from "@/components/BarChartAnswer";
import { MarkdownBody } from "@/components/MarkdownBody";
import { apiProgressPath, apiQuestionSupportPath, mathsTopicHref } from "@/lib/paths";
import { friendlySectionHeading, formatPracticeTopicLine } from "@/lib/question-display";
import type { FigureSpec } from "@/lib/figures";
import { FigureView } from "@/components/FigureView";
import {
  formatLevel,
  pickNextQuestionId,
} from "@/lib/practice-rating";
import type { ClientQuestionSupport } from "@/lib/question-support";
import type {
  PracticeClientMeta,
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
  domainLabel: string;
  topicSummary?: string;
  questions: ParsedQuestion[];
  answerMeta: Record<string, PracticeClientMeta>;
  figures: Record<string, FigureSpec>;
  initialRating: number;
  initialProgress: Record<string, AttemptState>;
};

export function QuestionPractice({
  tenant,
  domain,
  code,
  title,
  domainLabel,
  topicSummary,
  questions,
  answerMeta,
  figures,
  initialRating,
  initialProgress,
}: Props) {
  const api = apiProgressPath(tenant, domain, code);
  const topicHref = mathsTopicHref(tenant, domain, code);
  const [rating, setRating] = useState(initialRating);
  const [levelDelta, setLevelDelta] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<string, AttemptState>>(
    initialProgress,
  );
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [support, setSupport] = useState<ClientQuestionSupport | undefined>();
  const [supportForId, setSupportForId] = useState<string | null>(null);

  const ratingById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of questions) {
      const meta = answerMeta[q.id];
      if (meta) map[q.id] = meta.rating;
    }
    return map;
  }, [questions, answerMeta]);

  const pickNext = useCallback(
    (extraSession: string[], userRating: number) => {
      const ids = questions.map((q) => q.id).filter((id) => answerMeta[id]);
      return pickNextQuestionId({
        questionIds: ids,
        ratingById,
        userRating,
        sessionIds: extraSession,
      });
    },
    [questions, answerMeta, ratingById],
  );

  useEffect(() => {
    if (currentId) return;
    const first = pickNext([], rating);
    if (first) setCurrentId(first);
  }, [currentId, pickNext, rating]);

  useEffect(() => {
    if (!currentId) return;
    if (supportForId === currentId) return;
    let cancelled = false;
    setSupport(undefined);
    void fetch(apiQuestionSupportPath(tenant, domain, code, currentId))
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ClientQuestionSupport | null) => {
        if (cancelled || !data) return;
        setSupport(data);
        setSupportForId(currentId);
      });
    return () => {
      cancelled = true;
    };
  }, [currentId, tenant, domain, code, supportForId]);

  const question = currentId
    ? questions.find((q) => q.id === currentId)
    : undefined;
  const meta = currentId ? answerMeta[currentId] : undefined;

  const sessionCorrect = sessionIds.filter((id) => progress[id]?.correct).length;

  function goToNextQuestion() {
    setLevelDelta(null);
    const next = pickNext(sessionIds, rating);
    if (next) setCurrentId(next);
  }

  if (!currentId || !question || !meta) {
    return <p className="text-sm text-stone-500">One moment…</p>;
  }

  if (questions.length === 0) {
    return <p className="text-sm text-stone-600">No questions in this topic.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={topicHref}
          className="text-sm font-medium text-stone-600 hover:text-stone-900"
        >
          ← {title}
        </Link>
        <p className="text-sm text-stone-600">
          {sessionCorrect} right this session
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-stone-200 bg-stone-100 px-4 py-3">
        <p className="text-sm text-stone-700">
          Your level{" "}
          <span className="text-xl font-semibold tabular-nums text-stone-900">
            {formatLevel(rating)}
          </span>
          {levelDelta != null && levelDelta !== 0 ? (
            <span
              className={
                levelDelta > 0
                  ? "ml-2 text-sm font-semibold text-green-800"
                  : "ml-2 text-sm font-semibold text-red-800"
              }
            >
              {levelDelta > 0 ? "+" : ""}
              {levelDelta.toLocaleString("en-GB")}
            </span>
          ) : null}
        </p>
      </div>

      <QuestionAttempt
        key={question.id}
        question={question}
        meta={meta}
        figure={figures[question.id]}
        support={support}
        topicLine={formatPracticeTopicLine({
          domainLabel,
          topicCode: code,
          topicTitle: title,
          topicSummary,
        })}
        onAnswered={(data) => {
          setProgress(data.progress ?? {});
          if (data.rating != null) setRating(data.rating);
          if (data.ratingDelta != null) setLevelDelta(data.ratingDelta);
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
            ratingDelta?: number;
          };
        }}
        onNext={goToNextQuestion}
      />
    </div>
  );
}

type AttemptProps = {
  question: ParsedQuestion;
  meta: PracticeClientMeta;
  figure: FigureSpec | undefined;
  support: ClientQuestionSupport | undefined;
  topicLine: string;
  postAttempt: (
    body: Record<string, unknown>,
  ) => Promise<{
    correct: boolean;
    display: string;
    progress: Record<string, AttemptState>;
    rating?: number;
    ratingDelta?: number;
  }>;
  onAnswered: (data: {
    progress: Record<string, AttemptState>;
    rating?: number;
    ratingDelta?: number;
  }) => void;
  onNext: () => void;
};

function QuestionAttempt({
  question,
  meta,
  figure,
  support,
  topicLine,
  postAttempt,
  onAnswered,
  onNext,
}: AttemptProps) {
  const kind = meta.kind ?? "text";
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [barHeights, setBarHeights] = useState<number[]>(() =>
    meta.bars ? meta.bars.heights.map(() => 0) : [],
  );
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    display: string;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const passed = feedback?.correct === true;

  async function submit(body: Record<string, unknown>) {
    setPending(true);
    try {
      const data = await postAttempt(body);
      setFeedback({ correct: data.correct, display: data.display });
      onAnswered({
        progress: data.progress,
        rating: data.rating,
        ratingDelta: data.ratingDelta,
      });
    } finally {
      setPending(false);
    }
  }

  const showModelAnswer =
    feedback &&
    !feedback.correct &&
    feedback.display.trim().length > 0 &&
    feedback.display.trim() !== answer.trim();

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs leading-relaxed text-stone-500">{topicLine}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-stone-500">
        {friendlySectionHeading(question.section)}
      </p>

      <MarkdownBody
        markdown={question.text}
        className="worksheet-markdown mt-3 text-lg leading-relaxed text-stone-900"
      />

      {figure ? <FigureView spec={figure} /> : null}

      {support ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-950"
          >
            {showHint ? "Hide hint" : "Hint"}
          </button>
          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-950"
          >
            {showHelp ? "Hide help" : "Help"}
          </button>
        </div>
      ) : null}

      {support && showHint ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          {support.hint}
        </p>
      ) : null}

      {support && showHelp ? (
        <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm text-stone-800">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-900">
            Help
          </p>
          <MarkdownBody
            markdown={support.help}
            className="worksheet-markdown text-sm leading-relaxed"
          />
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        {kind === "text" ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-stone-700">
              Your answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              readOnly={feedback != null}
              rows={question.text.length > 120 ? 4 : 2}
              className={
                feedback != null
                  ? "w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-base text-stone-900"
                  : "w-full rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none ring-stone-400 focus:ring-2"
              }
            />
            {!feedback ? (
              <button
                type="button"
                disabled={pending || !answer.trim()}
                onClick={() => void submit({ answer })}
                className="w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50 sm:w-auto"
              >
                {pending ? "…" : "Go"}
              </button>
            ) : null}
          </div>
        ) : null}

        {feedback?.correct ? (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-base font-semibold text-green-900">
            Correct — well done!
          </p>
        ) : null}

        {showModelAnswer ? (
          <div className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="font-medium text-red-900">Not quite</p>
            <div className="mt-2 text-sm text-stone-800">
              <p className="font-medium text-stone-700">Answer:</p>
              <MarkdownBody
                markdown={feedback!.display}
                className="worksheet-markdown mt-1"
              />
            </div>
          </div>
        ) : null}

        {kind === "bar-chart" && meta.bars && !passed ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit({ barHeights });
            }}
            className="space-y-4"
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
              className="w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white sm:w-auto"
            >
              {pending ? "…" : "Go"}
            </button>
          </form>
        ) : null}

        {passed ? (
          <button
            type="button"
            onClick={onNext}
            className="w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white sm:w-auto"
          >
            Next question
          </button>
        ) : null}

        {feedback && !passed ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setAnswer("");
              }}
              className="rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-800"
            >
              Next question
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
