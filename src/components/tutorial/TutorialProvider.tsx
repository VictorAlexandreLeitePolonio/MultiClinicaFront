"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from "@/contexts/AuthContext";
import { TutorialContext } from "@/hooks/tutorial/useTutorial";
import { filterAccessibleSteps } from "@/lib/tutorials/tutorial.registry";
import type { ModuleTutorial, TaskTutorial, TutorialStep } from "@/lib/tutorials/tutorial.types";
import { markTaskCompleted, markTutorialCompleted } from "@/lib/tutorials/tutorial.storage";

// Elements from the target module's page may not be mounted yet right after
// navigating there — driver.js polls for up to this long before giving up.
const WAIT_FOR_ELEMENT_MS = 3000;

function isTaskTutorial(tutorial: ModuleTutorial | TaskTutorial): tutorial is TaskTutorial {
  return "moduleId" in tutorial;
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, can } = useAuth();
  const [activeTutorial, setActiveTutorial] = useState<ModuleTutorial | TaskTutorial | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const driverRef = useRef<Driver | null>(null);
  // Driver.js only carries {element, popover} per step — the route-change
  // watcher below needs the original advanceOn/expectedPathname/
  // expectedSearchParams, kept here in lockstep (same order) with driver's steps.
  const activeStepsRef = useRef<TutorialStep[]>([]);

  const startTutorial = useCallback(
    (tutorial: ModuleTutorial | TaskTutorial) => {
      driverRef.current?.destroy();

      // Modules like Pacientes/Agenda/Pagamentos reuse the same pathname for
      // list/create/view via ?mode=... — the tutorial's targets only exist on
      // the list view, so any query string means we're on the wrong subview
      // even when the pathname itself already matches.
      if (pathname !== tutorial.pathname || searchParams.toString() !== "") {
        router.push(tutorial.pathname);
      }

      const accessibleSteps = filterAccessibleSteps(tutorial.steps, user?.role, can);
      activeStepsRef.current = accessibleSteps;

      const driverObj = driver({
        // false, not just "fast": advanceOnClick/onDestroyed read driver.js's
        // internal __activeElement/__transitionCallback, which only populate
        // once its own highlight transition finishes — with animate:true that
        // takes the full `duration`, so a target-click step can silently eat
        // a real click made before that window closes. false finalizes on the
        // very first requestAnimationFrame tick instead, closing that gap.
        animate: false,
        popoverClass: "mc-tutorial-popover",
        showProgress: true,
        progressText: "{{current}} / {{total}}",
        nextBtnText: "Próximo",
        prevBtnText: "Anterior",
        doneBtnText: "Concluir",
        allowClose: true,
        skipMissingElement: true,
        waitForElement: WAIT_FOR_ELEMENT_MS,
        smoothScroll: true,
        steps: accessibleSteps.map((step) => {
          const advanceOn = step.advanceOn ?? "manual";
          return {
            element: step.target,
            advanceOnClick: advanceOn === "target-click",
            popover: {
              title: step.title,
              description: step.description,
              side: step.placement,
              // target-click / route-change steps advance on their own —
              // showing "Próximo" would let the user skip past the real action.
              // "close" stays so "Pular tutorial" is still reachable.
              showButtons: advanceOn === "manual" ? undefined : ["previous", "close"],
            },
          };
        }),
        onPopoverRender: (popoverDom) => {
          popoverDom.closeButton.textContent = "Pular tutorial";
          popoverDom.footerButtons.prepend(popoverDom.closeButton);
        },
        onDoneClick: () => {
          // Task tutorials only complete via completeTaskTutorial(), fired
          // from the module's own real success path — reaching the last
          // step (even clicking Concluir) never marks a task done by itself.
          if (!isTaskTutorial(tutorial)) {
            markTutorialCompleted(tutorial.id);
          }
          driverObj.destroy();
        },
        onDestroyed: () => {
          setIsRunning(false);
          setActiveTutorial(null);
          activeStepsRef.current = [];
          driverRef.current = null;
        },
      });

      driverRef.current = driverObj;
      setActiveTutorial(tutorial);
      setIsRunning(true);
      driverObj.drive();
    },
    [pathname, searchParams, router, user, can],
  );

  const completeTaskTutorial = useCallback((moduleId: string, taskId: string) => {
    markTaskCompleted(moduleId, taskId);
    driverRef.current?.destroy();
  }, []);

  // route-change steps: advance once the URL matches what the step expects.
  useEffect(() => {
    const driverObj = driverRef.current;
    if (!driverObj?.isActive()) return;

    const index = driverObj.getActiveIndex();
    if (index === undefined) return;

    const step = activeStepsRef.current[index];
    if (!step || step.advanceOn !== "route-change") return;

    const pathMatches = !step.expectedPathname || pathname === step.expectedPathname;
    const paramsMatch =
      !step.expectedSearchParams ||
      Object.entries(step.expectedSearchParams).every(([key, value]) => searchParams.get(key) === value);

    if (pathMatches && paramsMatch) driverObj.moveNext();
  }, [pathname, searchParams]);

  // A tour left mid-navigation (waiting on waitForElement) must not outlive
  // this provider — otherwise it keeps its document listeners bound.
  useEffect(() => {
    return () => driverRef.current?.destroy();
  }, []);

  const value = useMemo(
    () => ({ activeTutorial, isRunning, startTutorial, completeTaskTutorial }),
    [activeTutorial, isRunning, startTutorial, completeTaskTutorial],
  );

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}
