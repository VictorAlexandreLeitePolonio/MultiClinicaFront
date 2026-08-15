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
