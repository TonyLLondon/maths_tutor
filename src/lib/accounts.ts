import fs from "node:fs/promises";
import path from "node:path";
import { kvGet } from "./kv";
import type { TenantId } from "./tenants";
import { isTenantId } from "./tenants";

export type AccountRecord = {
  id: string;
  displayName: string;
  contentTenant: TenantId;
  /** Shorter rounds for younger players. */
  chessLevel?: "gentle" | "standard";
};

type AccountsFile = {
  version: number;
  users: AccountRecord[];
};

/** Optional KV patches (display labels only — cannot add users). */
type AccountKvOverrides = {
  users?: Record<string, { displayName?: string }>;
};

const ACCOUNTS_PATH = path.join(process.cwd(), "content", "accounts.json");
const KV_OVERRIDES_KEY = "mt:accounts:overrides";

export async function loadAccountRegistry(): Promise<AccountRecord[]> {
  const raw = await fs.readFile(ACCOUNTS_PATH, "utf8");
  const file = JSON.parse(raw) as AccountsFile;
  const base = file.users.filter(
    (u) => isTenantId(u.contentTenant) && u.id && u.displayName,
  );

  const overrides = await kvGet<AccountKvOverrides>(KV_OVERRIDES_KEY);
  if (!overrides?.users) return base;

  return base.map((user) => {
    const patch = overrides.users?.[user.id];
    if (!patch?.displayName) return user;
    return { ...user, displayName: patch.displayName };
  });
}

export async function getAccountById(
  id: string,
): Promise<AccountRecord | undefined> {
  const users = await loadAccountRegistry();
  return users.find((u) => u.id === id);
}

/** Match login input to id or displayName (case-insensitive). */
export async function resolveAccountFromLogin(
  loginName: string,
): Promise<AccountRecord | null> {
  const trimmed = loginName.trim();
  if (!trimmed) return null;
  const norm = trimmed.toLowerCase();
  const users = await loadAccountRegistry();
  return (
    users.find(
      (u) =>
        u.id.toLowerCase() === norm ||
        u.displayName.toLowerCase() === norm,
    ) ?? null
  );
}

export function allowedLoginHint(users: AccountRecord[]): string {
  return users.map((u) => u.displayName).join(" or ");
}
