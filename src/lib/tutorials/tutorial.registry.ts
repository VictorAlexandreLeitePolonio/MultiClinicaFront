import type { ModuleTutorial } from "./tutorial.types";
import { agendaTutorial } from "./modules/agenda.tutorial";

export const tutorialRegistry: ModuleTutorial[] = [agendaTutorial];

export function resolveTutorialByPathname(pathname: string): ModuleTutorial | null {
  const path = pathname.split("?")[0];
  return (
    tutorialRegistry.find(
      (tutorial) => path === tutorial.pathname || path.startsWith(`${tutorial.pathname}/`),
    ) ?? null
  );
}
