import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getAnswerKey } from "@/lib/content";
import { gradePracticeAttempt } from "@/lib/questions";
import { getTopicProgress, saveQuestionAttempt } from "@/lib/progress";
import { isTenantId } from "@/lib/tenants";

type Ctx = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

function topicPath(domain: string, code: string): string {
  return `${domain}/${code}`;
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

  const progress = await getTopicProgress(
    session.userId,
    "maths",
    topicPath(domain, code),
  );
  return NextResponse.json({ progress });
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
    selfCheckCorrect?: boolean;
    barHeights?: number[];
  };
  const questionId = body.questionId ?? "";

  const key = await getAnswerKey(tenant, slug);
  const entry = key?.answers[questionId];
  if (!entry) {
    return NextResponse.json(
      { error: "No answer key for this question" },
      { status: 404 },
    );
  }

  const { correct, display } = gradePracticeAttempt(entry, {
    questionId,
    answer: body.answer,
    selfCheckCorrect: body.selfCheckCorrect,
    barHeights: body.barHeights,
  });
  const existing = await getTopicProgress(session.userId, "maths", slug);
  const prev = existing[questionId];
  const lastAnswer =
    body.barHeights != null
      ? body.barHeights.join(",")
      : body.selfCheckCorrect != null
        ? body.selfCheckCorrect
          ? "got-it"
          : "retry"
        : (body.answer ?? "");
  const attempt = {
    correct: correct || prev?.correct === true,
    attempts: (prev?.attempts ?? 0) + 1,
    lastAnswer,
    updatedAt: new Date().toISOString(),
  };
  await saveQuestionAttempt(session.userId, "maths", slug, questionId, attempt);
  const progress = await getTopicProgress(session.userId, "maths", slug);

  return NextResponse.json({ correct, display, progress });
}
