import { UserRole } from "@/types";

export const CLINIC_APP_ROLES: UserRole[] = [
  "Administrador",
  "Profissional",
  "Recepcao",
];

export function getDashboardPathByRole(role: UserRole): string {
  return role === "SuperAdmin" ? "/superadmin" : "/app";
}

export function canAccessClinicApp(role: UserRole): boolean {
  return CLINIC_APP_ROLES.includes(role);
}

export function canAccessSuperAdmin(role: UserRole): boolean {
  return role === "SuperAdmin";
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    SuperAdmin: "SuperAdmin",
    Administrador: "Administrador",
    Profissional: "Profissional",
    Recepcao: "Recepcao",
  };

  return labels[role];
}
