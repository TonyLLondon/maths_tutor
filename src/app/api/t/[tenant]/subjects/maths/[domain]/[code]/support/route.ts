import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getQuestionSupport } from "@/lib/content";
import { isGcseDomain } from "@/lib/subjects";
import { isTenantId } from "@/lib/tenants";

type Ctx = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

export async function GET(request: Request, { params }: Ctx) {
  const { tenant, domain, code } = await params;
  if (!isTenantId(tenant) || !isGcseDomain(domain)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    await requireSession(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const questionId = new URL(request.url).searchParams.get("questionId")?.trim();
  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }

  const slug = `${domain}/${code}`;
  const file = await getQuestionSupport(tenant, slug);
  const entry = file?.questions[questionId];
  if (!entry) {
    return NextResponse.json({ error: "No support for this question" }, { status: 404 });
  }

  return NextResponse.json(entry, {
    headers: { "Cache-Control": "private, max-age=3600" },
  });
}
