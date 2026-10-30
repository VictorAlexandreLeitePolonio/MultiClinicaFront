import type { BillingCycle, ClinicPlan } from "@/types/plans";

export interface SignupPlanSelection {
  plan: Exclude<ClinicPlan, "Free">;
  cycle: BillingCycle;
}

export const SIGNUP_PLAN_KEY = "cliniq:signup-plan";

export function parseSignupPlan(plan: string | null, cycle: string | null): SignupPlanSelection | null {
  if (plan !== "Pro" && plan !== "Premium") return null;
  if (cycle !== "Monthly" && cycle !== "Annual") return null;
  return { plan, cycle };
}

export function saveSignupPlan(selection: SignupPlanSelection) {
  try {
    sessionStorage.setItem(SIGNUP_PLAN_KEY, JSON.stringify(selection));
  } catch {
    // sessionStorage indisponível: o cadastro segue sem lembrar o plano escolhido.
  }
}

export function readSignupPlan(): SignupPlanSelection | null {
  try {
    const raw = sessionStorage.getItem(SIGNUP_PLAN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SignupPlanSelection>;
    return parseSignupPlan(parsed.plan ?? null, parsed.cycle ?? null);
  } catch {
    return null;
  }
}
