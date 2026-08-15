import type { UserRole } from "@/types";
import type { ModuleTutorial, TaskTutorial, TutorialModuleId, TutorialStep } from "./tutorial.types";
import { agendaTutorial } from "./definitions/agenda/module.tutorial";
import { dashboardTutorial } from "./definitions/dashboard/module.tutorial";
import { evolutionTemplatesTutorial } from "./definitions/evolution-templates/module.tutorial";
import { financialTutorial } from "./definitions/financial/module.tutorial";
import { medicalRecordsTutorial } from "./definitions/medical-records/module.tutorial";
import { patientsTutorial } from "./definitions/patients/module.tutorial";
import { paymentsTutorial } from "./definitions/payments/module.tutorial";
import { stockCategoriesTutorial } from "./definitions/stock-categories/module.tutorial";
import { stockMovementsTutorial } from "./definitions/stock-movements/module.tutorial";
import { createMovementTask } from "./definitions/stock-movements/tasks/create-movement.tutorial";
import { purchasesTutorial } from "./definitions/purchases/module.tutorial";
import { createPurchaseTask } from "./definitions/purchases/tasks/create-purchase.tutorial";
import { stockProductsTutorial } from "./definitions/stock-products/module.tutorial";
import { createProductTask } from "./definitions/stock-products/tasks/create-product.tutorial";
import { suppliersTutorial } from "./definitions/suppliers/module.tutorial";
import { createSupplierTask } from "./definitions/suppliers/tasks/create-supplier.tutorial";
import { usersTutorial } from "./definitions/users/module.tutorial";
import { plansTutorial } from "./definitions/plans/module.tutorial";
import { settingsTutorial } from "./definitions/settings/module.tutorial";
import { updateSettingsTask } from "./definitions/settings/tasks/update-settings.tutorial";

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
  settingsTutorial,
];

// Ações guiadas: apenas fluxos que abrem o formulário na MESMA tela (modal ou
// render condicional). Fluxos "criar" que fazem router.push para outra rota
// (pacientes, agenda, prontuários, pagamentos, usuários, modelos) foram
// removidos: durante a navegação do Next o tour some/trava, e um tour guiado
// não pode depender de um alvo que só monta depois de uma troca de rota.
export const taskRegistry: TaskTutorial[] = [
  createProductTask,
  createMovementTask,
  createPurchaseTask,
  createSupplierTask,
  updateSettingsTask,
];

export function getTasksForModule(
  moduleId: TutorialModuleId,
  role: UserRole | undefined,
  can: (permission: string) => boolean,
): TaskTutorial[] {
  return taskRegistry.filter(
    (task) => task.moduleId === moduleId && canAccessTutorial(task, role, can),
  );
}

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
