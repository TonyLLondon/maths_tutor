export type TenantId = "archer";

export type TenantConfig = {
  id: TenantId;
  name: string;
  subtitle: string;
};

export const TENANTS: Record<TenantId, TenantConfig> = {
  archer: {
    id: "archer",
    name: "Archer",
    subtitle: "GCSE-aligned maths worksheets",
  },
};

export const DEFAULT_TENANT: TenantId = "archer";

export function isTenantId(value: string): value is TenantId {
  return value in TENANTS;
}

/** Login is the tenant display name (case-insensitive), e.g. "Archer". */
export function nameMatchesTenant(tenantId: TenantId, name: string): boolean {
  const tenant = TENANTS[tenantId];
  return name.trim().toLowerCase() === tenant.name.toLowerCase();
}
