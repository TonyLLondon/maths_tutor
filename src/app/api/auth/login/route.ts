import { NextResponse } from "next/server";
import { createSession, validateLogin } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { name?: string };
  try {
    body = (await request.json()) as { name?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const account = await validateLogin(name);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await createSession(account);
  return NextResponse.json({
    ok: true,
    userId: account.id,
    tenant: account.contentTenant,
  });
}
