import type { UserRole } from "@/types";
import type { ModuleTutorial, TutorialStep } from "./tutorial.types";
import { agendaTutorial } from "./definitions/agenda/module.tutorial";
import { dashboardTutorial } from "./definitions/dashboard/module.tutorial";
import { evolutionTemplatesTutorial } from "./definitions/evolution-templates/module.tutorial";
import { financialTutorial } from "./definitions/financial/module.tutorial";
import { medicalRecordsTutorial } from "./definitions/medical-records/module.tutorial";
import { patientsTutorial } from "./definitions/patients/module.tutorial";
import { paymentsTutorial } from "./definitions/payments/module.tutorial";
import { stockCategoriesTutorial } from "./definitions/stock-categories/module.tutorial";
import { stockMovementsTutorial } from "./definitions/stock-movements/module.tutorial";
import { purchasesTutorial } from "./definitions/purchases/module.tutorial";
import { stockProductsTutorial } from "./definitions/stock-products/module.tutorial";
import { suppliersTutorial } from "./definitions/suppliers/module.tutorial";
import { usersTutorial } from "./definitions/users/module.tutorial";
import { plansTutorial } from "./definitions/plans/module.tutorial";

export const tutorialRegistry: ModuleTutorial[] = [
  dashboardTutorial,
  patientsTutorial,
  agendaTutorial,
  medicalRecordsTutorial,
  evolutionTemplatesTutorial,
  paymentsTutorial,
  financialTutorial,
  stockProductsTutorial,
  stockCategoriesTutorial,
  stockMovementsTutorial,
  suppliersTutorial,
  purchasesTutorial,
  usersTutorial,
  plansTutorial,
];

export function resolveTutorialByPathname(pathname: string): ModuleTutorial | null {
  const path = pathname.split("?")[0];
  const candidates = tutorialRegistry.filter((tutorial) => {
    if (path === tutorial.pathname) return true;
    // "/app" is the shared root for every route under it — unlike a module's
    // own subtree (e.g. "/app/agenda/123"), it must only match itself exactly.
    if (tutorial.pathname === "/app") return false;
    return path.startsWith(`${tutorial.pathname}/`);
  });
  if (candidates.length === 0) return null;
  // Prefer the most specific (longest) pathname match, regardless of registry order.
  return candidates.reduce((best, current) =>
    current.pathname.length > best.pathname.length ? current : best,
  );
}

/** Shared by ModuleTutorial and TutorialStep — both gate on the same two fields. */
export function canAccessTutorial(
  gated: { roles?: UserRole[]; permission?: string },
  role: UserRole | undefined,
  can: (permission: string) => boolean,
): boolean {
  if (gated.roles && (!role || !gated.roles.includes(role))) return false;
  if (gated.permission && !can(gated.permission)) return false;
  return true;
}

export function filterAccessibleSteps(
  steps: TutorialStep[],
  role: UserRole | undefined,
  can: (permission: string) => boolean,
): TutorialStep[] {
  return steps.filter((step) => canAccessTutorial(step, role, can));
}
