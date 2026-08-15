import type { UserRole } from "@/types";
import type { ModuleTutorial, TutorialStep } from "./tutorial.types";
import { agendaTutorial } from "./definitions/agenda/module.tutorial";

export const tutorialRegistry: ModuleTutorial[] = [agendaTutorial];

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
