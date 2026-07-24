import { requireSession } from "@/lib/auth";
import type { NavCrumb } from "@/lib/nav-crumbs";
import type { TenantId } from "@/lib/tenants";
import { TenantNav } from "./TenantNav";

export async function ServerTenantNav({
  tenantId,
  crumbs,
}: {
  tenantId: TenantId;
  crumbs: NavCrumb[];
}) {
  const session = await requireSession(tenantId);
  return (
    <TenantNav
      tenantId={tenantId}
      userName={session.displayName}
      crumbs={crumbs}
      isParent={session.isParent}
    />
  );
}
