import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { requireSession } from "@/lib/auth";
import { isTenantId } from "@/lib/tenants";
import { kvDel, kvSet, worksheetOverrideKey } from "@/lib/kv";

type Ctx = { params: Promise<{ tenant: string; slug: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const { tenant, slug } = await params;
  if (!isTenantId(tenant)) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  try {
    await requireSession(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const markdown = await request.text();
  try {
    matter(markdown);
  } catch {
    return NextResponse.json({ error: "Invalid markdown frontmatter" }, { status: 400 });
  }

  await kvSet(worksheetOverrideKey(tenant, slug), markdown);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { tenant, slug } = await params;
  if (!isTenantId(tenant)) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  try {
    await requireSession(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await kvDel(worksheetOverrideKey(tenant, slug));
  return NextResponse.json({ ok: true });
}

export async function GET(_request: Request, { params }: Ctx) {
  const { tenant, slug } = await params;
  if (!isTenantId(tenant)) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });
  }
  try {
    await requireSession(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filePath = path.join(
    process.cwd(),
    "content",
    "tenants",
    tenant,
    "worksheets",
    `${slug}.md`,
  );
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return new NextResponse(raw, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
