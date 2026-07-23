export type TenantId = "archer";

export type TenantConfig = {
  id: TenantId;
  name: string;
  subtitle: string;
};

export const TENANTS: Record<TenantId, TenantConfig> = {
  archer: {
    id: "archer",
    name: "Lewis family",
    subtitle: "GCSE-aligned maths worksheets",
  },
};

export const DEFAULT_TENANT: TenantId = "archer";

export function isTenantId(value: string): value is TenantId {
  return value in TENANTS;
}
