import type { UserRole } from "@/types";

export type TutorialModuleId =
  | "agenda"
  | "dashboard"
  | "patients"
  | "medical-records"
  | "evolution-templates"
  | "payments"
  | "financial"
  | "stock-products"
  | "stock-categories"
  | "stock-movements"
  | "suppliers"
  | "purchases"
  | "users"
  | "plans"
  | "settings";

export type TutorialPlacement = "top" | "right" | "bottom" | "left";

/**
 * How a step hands off to the next one:
 * - "manual": the built-in Próximo/Anterior buttons (module tutorials always use this).
 * - "target-click": hides Próximo — advances when the user clicks the real
 *   highlighted element (driver.js's own advanceOnClick), never a simulated click.
 * - "route-change": hides Próximo — advances once pathname/searchParams match
 *   expectedPathname/expectedSearchParams, watched by TutorialProvider.
 */
export type TutorialAdvanceMode = "manual" | "target-click" | "route-change";

export interface TutorialStep {
  id: string;
  target: string;
  title: string;
  description: string;
  placement?: TutorialPlacement;
  /** Step only shows if the user's role is included. Omit to allow every role. */
  roles?: UserRole[];
  /** Step only shows if useAuth().can(permission) is true. Omit to skip the check. */
  permission?: string;
  /** Defaults to "manual". */
  advanceOn?: TutorialAdvanceMode;
  /** Only meaningful with advanceOn: "route-change". Omit to match any pathname. */
  expectedPathname?: string;
  /** Only meaningful with advanceOn: "route-change". Every entry must match. */
  expectedSearchParams?: Record<string, string>;
}

export interface ModuleTutorial {
  id: TutorialModuleId;
  title: string;
  pathname: string;
  /** Tutorial only appears if the user's role is included. Omit to allow every role. */
  roles?: UserRole[];
  /** Tutorial only appears if useAuth().can(permission) is true. Omit to skip the check. */
  permission?: string;
  steps: TutorialStep[];
}

/**
 * A guided action ("how do I do X") scoped to one module, as opposed to
 * ModuleTutorial's "what's on this screen". Surfaced in the mascot's
 * "Ações guiadas" menu section for the module it belongs to, not the catalog.
 */
export interface TaskTutorial {
  id: string;
  moduleId: TutorialModuleId;
  title: string;
  pathname: string;
  roles?: UserRole[];
  permission?: string;
  steps: TutorialStep[];
}
