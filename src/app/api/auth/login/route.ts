import { NextResponse } from "next/server";
import { createSession, validateLogin } from "@/lib/auth";
import { isTenantId } from "@/lib/tenants";

export async function POST(request: Request) {
  let body: { tenant?: string; name?: string; password?: string };
  try {
    body = (await request.json()) as {
      tenant?: string;
      name?: string;
      password?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const tenant = body.tenant;
  const name = (body.name ?? body.password ?? "").trim();
  if (!tenant || !isTenantId(tenant)) {
    return NextResponse.json({ error: "Unknown tenant" }, { status: 400 });
  }

  if (!validateLogin(tenant, name)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await createSession(tenant);
  return NextResponse.json({ ok: true, tenant });
}
