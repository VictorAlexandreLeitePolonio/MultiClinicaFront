"use client";

import { createContext, useContext } from "react";
import type { ModuleTutorial, TaskTutorial } from "@/lib/tutorials/tutorial.types";

export interface TutorialContextValue {
  activeTutorial: ModuleTutorial | TaskTutorial | null;
  isRunning: boolean;
  startTutorial: (tutorial: ModuleTutorial | TaskTutorial) => void;
  /**
   * Marks a guided action complete from the module's own real success path
   * (e.g. right after a create form's API call succeeds) — never inferred
   * from reaching a step or clicking a button.
   */
  completeTaskTutorial: (moduleId: string, taskId: string) => void;
}

export const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useTutorial deve ser usado dentro de TutorialProvider");
  return ctx;
}
