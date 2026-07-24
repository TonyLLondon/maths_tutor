import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getAnswerKey, getWorksheet } from "@/lib/content";
import {
  gradePracticeAttempt,
  parseQuestions,
  type AnswerEntry,
} from "@/lib/questions";
import { nextUserRating, effectiveQuestionRating as ratingForQuestion } from "@/lib/practice-rating";
import {
  getTopicProgressState,
  saveQuestionAttempt,
} from "@/lib/progress";
import { isTenantId } from "@/lib/tenants";

type Ctx = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

function topicPath(domain: string, code: string): string {
  return `${domain}/${code}`;
}

function questionRating(
  entry: AnswerEntry,
  questionId: string,
  sectionTier: 1 | 2 | 3,
): number {
  const tier = entry.tier ?? sectionTier;
  return ratingForQuestion(entry.rating, tier, questionId);
}

export async function GET(_req: Request, { params }: Ctx) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant)) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  let session;
  try {
    session = await requireSession(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = topicPath(domain, code);
  const state = await getTopicProgressState(
    session.userId,
    "maths",
    slug,
  );
  return NextResponse.json({
    progress: state.questions,
    rating: state.rating,
    ratingHistory: state.ratingHistory ?? [],
  });
}

export async function POST(request: Request, { params }: Ctx) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant)) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  let session;
  try {
    session = await requireSession(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = topicPath(domain, code);
  const body = (await request.json()) as {
    questionId?: string;
    answer?: string;
    barHeights?: number[];
  };
  const questionId = body.questionId ?? "";

  const [key, doc, state] = await Promise.all([
    getAnswerKey(tenant, slug),
    getWorksheet(tenant, slug),
    getTopicProgressState(session.userId, "maths", slug),
  ]);
  const entry = key?.answers[questionId];
  if (!entry) {
    return NextResponse.json(
      { error: "No answer key for this question" },
      { status: 404 },
    );
  }

  const questions = doc ? parseQuestions(doc.body) : [];
  const sectionTier = doc
    ? (questions.find((q) => q.id === questionId)?.tier ?? 2)
    : 2;

  const qRating = questionRating(entry, questionId, sectionTier);
  const ratingBefore = state.rating;

  const { correct, display } = gradePracticeAttempt(entry, {
    questionId,
    answer: body.answer,
    barHeights: body.barHeights,
  });

  const prev = state.questions[questionId];
  const lastAnswer =
    body.barHeights != null
      ? body.barHeights.join(",")
      : (body.answer ?? "");

  const attempt = {
    correct,
    attempts: (prev?.attempts ?? 0) + 1,
    lastAnswer,
    updatedAt: new Date().toISOString(),
  };

  const ratingAfter = nextUserRating(state.rating, qRating, correct);

  const updated = await saveQuestionAttempt(
    session.userId,
    "maths",
    slug,
    questionId,
    attempt,
    ratingAfter,
    state,
  );

  return NextResponse.json({
    correct,
    display,
    progress: updated.questions,
    rating: updated.rating,
    ratingDelta: updated.rating - ratingBefore,
    ratingHistory: updated.ratingHistory ?? [],
  });
}
