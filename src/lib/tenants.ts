export type TenantId = "lewis";

export type TenantConfig = {
  id: TenantId;
  name: string;
  subtitle: string;
};

/** Shared household content (worksheets, starters) — not a child’s login id. */
export const TENANTS: Record<TenantId, TenantConfig> = {
  lewis: {
    id: "lewis",
    name: "Lewis family",
    subtitle: "GCSE-aligned maths worksheets",
  },
};

export const DEFAULT_TENANT: TenantId = "lewis";

/** @deprecated Old URL slug; redirects to {@link DEFAULT_TENANT}. */
export const LEGACY_TENANT_SLUGS = ["archer"] as const;

export function isTenantId(value: string): value is TenantId {
  return value in TENANTS;
}

export function canonicalTenantSlug(slug: string): TenantId | null {
  if (isTenantId(slug)) return slug;
  if ((LEGACY_TENANT_SLUGS as readonly string[]).includes(slug)) {
    return DEFAULT_TENANT;
  }
  return null;
}
