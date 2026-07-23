import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { requireSession } from "@/lib/auth";
import { isTenantId } from "@/lib/tenants";
import { kvDel, kvSet, worksheetOverrideKey } from "@/lib/kv";

function repoPaths(tenant: string, slug: string): string[] {
  const normalized = slug.split("/").join(path.sep);
  return [
    path.join(process.cwd(), "content", "tenants", tenant, "topics", `${normalized}.md`),
    path.join(process.cwd(), "content", "tenants", tenant, "worksheets", `${normalized}.md`),
  ];
}

async function readRepoMarkdown(tenant: string, slug: string): Promise<string | null> {
  for (const filePath of repoPaths(tenant, slug)) {
    try {
      return await fs.readFile(filePath, "utf8");
    } catch {
      continue;
    }
  }
  return null;
}

type SlugCtx = { params: Promise<{ tenant: string; slug: string }> };
type TopicCtx = {
  params: Promise<{ tenant: string; domain: string; code: string }>;
};

async function authorize(tenant: string) {
  if (!isTenantId(tenant)) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  try {
    await requireSession(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PUT(request: Request, { params }: SlugCtx) {
  const { tenant, slug } = await params;
  const auth = await authorize(tenant);
  if (auth) return auth;

  const markdown = await request.text();
  try {
    matter(markdown);
  } catch {
    return NextResponse.json({ error: "Invalid markdown frontmatter" }, { status: 400 });
  }

  await kvSet(worksheetOverrideKey(tenant, slug), markdown);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: SlugCtx) {
  const { tenant, slug } = await params;
  const auth = await authorize(tenant);
  if (auth) return auth;

  await kvDel(worksheetOverrideKey(tenant, slug));
  return NextResponse.json({ ok: true });
}

export async function GET(_request: Request, { params }: SlugCtx) {
  const { tenant, slug } = await params;
  const auth = await authorize(tenant);
  if (auth) return auth;

  const raw = await readRepoMarkdown(tenant, slug);
  if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(raw, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function PUT_TOPIC(request: Request, ctx: TopicCtx) {
  const { tenant, domain, code } = await ctx.params;
  return PUT(request, {
    params: Promise.resolve({ tenant, slug: `${domain}/${code}` }),
  });
}

export async function DELETE_TOPIC(_request: Request, ctx: TopicCtx) {
  const { tenant, domain, code } = await ctx.params;
  return DELETE(_request, {
    params: Promise.resolve({ tenant, slug: `${domain}/${code}` }),
  });
}

export async function GET_TOPIC(_request: Request, ctx: TopicCtx) {
  const { tenant, domain, code } = await ctx.params;
  return GET(_request, {
    params: Promise.resolve({ tenant, slug: `${domain}/${code}` }),
  });
}
