export type TenantId = "archer";

export type TenantConfig = {
  id: TenantId;
  name: string;
  subtitle: string;
  passwordEnvKey: string;
};

export const TENANTS: Record<TenantId, TenantConfig> = {
  archer: {
    id: "archer",
    name: "Archer",
    subtitle: "GCSE-aligned maths worksheets",
    passwordEnvKey: "TENANT_ARCHER_PASSWORD",
  },
};

export const DEFAULT_TENANT: TenantId = "archer";

export function isTenantId(value: string): value is TenantId {
  return value in TENANTS;
}

export function getTenantPassword(tenantId: TenantId): string {
  const tenant = TENANTS[tenantId];
  const fromEnv = process.env[tenant.passwordEnvKey];
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "development") return "archer-dev";
  return "";
}
