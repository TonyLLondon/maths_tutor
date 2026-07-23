import type { TenantId } from "./tenants";
import { isTenantId } from "./tenants";

export type SessionPayload = {
  userId: string;
  displayName: string;
  tenant: TenantId;
  exp: number;
};

/** Fixed signing material — family app, not a deployed secret. */
const COOKIE_SIGNING_KEY = "maths-tutor-family-session-v2";

async function hmacSign(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(COOKIE_SIGNING_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Buffer.from(sig).toString("base64url");
}

async function hmacVerify(message: string, signature: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(COOKIE_SIGNING_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  try {
    return await crypto.subtle.verify(
      "HMAC",
      key,
      Buffer.from(signature, "base64url"),
      enc.encode(message),
    );
  } catch {
    return false;
  }
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = await hmacSign(body);
  return `${body}.${sig}`;
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (!(await hmacVerify(body, sig))) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.userId || !isTenantId(payload.tenant)) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
