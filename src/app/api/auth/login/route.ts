import { NextResponse } from "next/server";
import { createSession, validateLogin } from "@/lib/auth";
import { isTenantId } from "@/lib/tenants";

export async function POST(request: Request) {
  let body: { tenant?: string; password?: string };
  try {
    body = (await request.json()) as { tenant?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const tenant = body.tenant;
  const password = body.password ?? "";
  if (!tenant || !isTenantId(tenant)) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 400 });
  }

  if (!validateLogin(tenant, password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await createSession(tenant);
  return NextResponse.json({ ok: true, tenant });
}
