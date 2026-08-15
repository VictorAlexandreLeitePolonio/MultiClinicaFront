"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from "@/contexts/AuthContext";
import { TutorialContext } from "@/hooks/tutorial/useTutorial";
import { filterAccessibleSteps } from "@/lib/tutorials/tutorial.registry";
import type { ModuleTutorial } from "@/lib/tutorials/tutorial.types";
import { markTutorialCompleted } from "@/lib/tutorials/tutorial.storage";

// Elements from the target module's page may not be mounted yet right after
// navigating there — driver.js polls for up to this long before giving up.
const WAIT_FOR_ELEMENT_MS = 3000;

export function TutorialProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, can } = useAuth();
  const [activeTutorial, setActiveTutorial] = useState<ModuleTutorial | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const driverRef = useRef<Driver | null>(null);

  const startTutorial = useCallback(
    (tutorial: ModuleTutorial) => {
      driverRef.current?.destroy();

      // Modules like Pacientes/Agenda/Pagamentos reuse the same pathname for
      // list/create/view via ?mode=... — the tutorial's targets only exist on
      // the list view, so any query string means we're on the wrong subview
      // even when the pathname itself already matches.
      if (pathname !== tutorial.pathname || searchParams.toString() !== "") {
        router.push(tutorial.pathname);
      }

      const accessibleSteps = filterAccessibleSteps(tutorial.steps, user?.role, can);

      const driverObj = driver({
        animate: true,
        duration: 200,
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
        steps: accessibleSteps.map((step) => ({
          element: step.target,
          popover: {
            title: step.title,
            description: step.description,
            side: step.placement,
          },
        })),
        onPopoverRender: (popoverDom) => {
          popoverDom.closeButton.textContent = "Pular tutorial";
          popoverDom.footerButtons.prepend(popoverDom.closeButton);
        },
        onDoneClick: () => {
          markTutorialCompleted(tutorial.id);
          driverObj.destroy();
        },
        onDestroyed: () => {
          setIsRunning(false);
          setActiveTutorial(null);
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

  // A tour left mid-navigation (waiting on waitForElement) must not outlive
  // this provider — otherwise it keeps its document listeners bound.
  useEffect(() => {
    return () => driverRef.current?.destroy();
  }, []);

  const value = useMemo(
    () => ({ activeTutorial, isRunning, startTutorial }),
    [activeTutorial, isRunning, startTutorial],
  );

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}
