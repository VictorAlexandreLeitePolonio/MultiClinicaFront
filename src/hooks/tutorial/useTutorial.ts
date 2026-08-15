"use client";

import { createContext, useContext } from "react";
import type { ModuleTutorial } from "@/lib/tutorials/tutorial.types";

export interface TutorialContextValue {
  activeTutorial: ModuleTutorial | null;
  isRunning: boolean;
  startTutorial: (tutorial: ModuleTutorial) => void;
}

export const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useTutorial deve ser usado dentro de TutorialProvider");
  return ctx;
}
