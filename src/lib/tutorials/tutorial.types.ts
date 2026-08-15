export type TutorialModuleId = "agenda";

export type TutorialPlacement = "top" | "right" | "bottom" | "left";

export interface TutorialStep {
  id: string;
  target: string;
  title: string;
  description: string;
  placement?: TutorialPlacement;
}

export interface ModuleTutorial {
  id: TutorialModuleId;
  title: string;
  pathname: string;
  steps: TutorialStep[];
}
