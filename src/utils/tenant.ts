import { AuthTenant } from "@/types";

export const DEFAULT_TENANT_THEME = {
  primaryColor: "#2563EB",
  secondaryColor: "#0F172A",
  accentColor: "#22C55E",
};

export function isValidHexColor(value: string | null | undefined): value is string {
  return /^#[A-Fa-f0-9]{6}$/.test(value ?? "");
}

export function getTenantTheme(tenant: AuthTenant | null) {
  return {
    primaryColor: isValidHexColor(tenant?.primaryColor)
      ? tenant.primaryColor
      : DEFAULT_TENANT_THEME.primaryColor,
    secondaryColor: isValidHexColor(tenant?.secondaryColor)
      ? tenant.secondaryColor
      : DEFAULT_TENANT_THEME.secondaryColor,
    accentColor: isValidHexColor(tenant?.accentColor)
      ? tenant.accentColor
      : DEFAULT_TENANT_THEME.accentColor,
  };
}
