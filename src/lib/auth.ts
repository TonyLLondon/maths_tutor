import { cookies } from "next/headers";
import {
  getAccountById,
  loadAccountRegistry,
  resolveAccountFromLogin,
  type AccountRecord,
} from "./accounts";
import type { TenantId } from "./tenants";
import {
  signSession,
  verifySessionToken,
  type SessionPayload,
} from "./session";

export type { SessionPayload };

const COOKIE_NAME = "mt_session";
const SESSION_DAYS = 14;

export { verifySessionToken };

async function hydrateSession(
  payload: SessionPayload,
): Promise<SessionPayload | null> {
  const account = await getAccountById(payload.userId);
  if (!account) return null;
  if (account.contentTenant !== payload.tenant) return null;
  return {
    ...payload,
    displayName: account.displayName,
  };
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  return hydrateSession(payload);
}

export async function requireSession(
  tenant?: TenantId,
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (tenant && session.tenant !== tenant) throw new Error("FORBIDDEN");
  return session;
}

export async function validateLogin(name: string): Promise<AccountRecord | null> {
  return resolveAccountFromLogin(name);
}

export async function createSession(account: AccountRecord): Promise<void> {
  const payload: SessionPayload = {
    userId: account.id,
    displayName: account.displayName,
    tenant: account.contentTenant,
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

export async function listAllowedAccounts(): Promise<AccountRecord[]> {
  return loadAccountRegistry();
}
