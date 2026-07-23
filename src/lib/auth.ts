import { cookies } from "next/headers";
import crypto from "node:crypto";
import type { TenantId } from "./tenants";
import { getTenantPassword, isTenantId } from "./tenants";
import {
  signSession,
  verifySessionToken,
  type SessionPayload,
} from "./session";

export type { SessionPayload };

const COOKIE_NAME = "mt_session";
const SESSION_DAYS = 14;

export { verifySessionToken };

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(tenant?: TenantId): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (tenant && session.tenant !== tenant) throw new Error("FORBIDDEN");
  return session;
}

export function validateLogin(tenant: TenantId, password: string): boolean {
  const expected = getTenantPassword(tenant);
  if (!expected) return false;
  if (expected.length !== password.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(password));
}

export async function createSession(tenant: TenantId): Promise<void> {
  const payload: SessionPayload = {
    tenant,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  const jar = await cookies();
  jar.set(COOKIE_NAME, await signSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
