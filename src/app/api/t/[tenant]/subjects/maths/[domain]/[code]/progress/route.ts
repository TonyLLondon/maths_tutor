import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getAnswerKey } from "@/lib/content";
import { gradeAnswer } from "@/lib/questions";
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
  try {
    await requireSession(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await getTopicProgress(
    tenant,
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
  try {
    await requireSession(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = topicPath(domain, code);
  const body = (await request.json()) as {
    questionId?: string;
    answer?: string;
  };
  const questionId = body.questionId ?? "";
  const userAnswer = body.answer ?? "";

  const key = await getAnswerKey(tenant, slug);
  const entry = key?.answers[questionId];
  if (!entry) {
    return NextResponse.json(
      { error: "No answer key for this question" },
      { status: 404 },
    );
  }

  const { correct, display } = gradeAnswer(entry, userAnswer);
  const existing = await getTopicProgress(tenant, "maths", slug);
  const prev = existing[questionId];
  const attempt = {
    correct: correct || prev?.correct === true,
    attempts: (prev?.attempts ?? 0) + 1,
    lastAnswer: userAnswer,
    updatedAt: new Date().toISOString(),
  };
  await saveQuestionAttempt(tenant, "maths", slug, questionId, attempt);
  const progress = await getTopicProgress(tenant, "maths", slug);

  return NextResponse.json({ correct, display, progress });
}
