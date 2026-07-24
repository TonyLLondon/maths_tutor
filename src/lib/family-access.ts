import { notFound } from "next/navigation";
import type { AccountRecord } from "./accounts";
import { isParentAccount } from "./accounts";
import { getSessionAccount, requireSession } from "./auth";
import type { TenantId } from "./tenants";

export async function requireParentAccount(
  tenant: TenantId,
): Promise<AccountRecord> {
  await requireSession(tenant);
  const account = await getSessionAccount();
  if (!account || !isParentAccount(account)) notFound();
  return account;
}
