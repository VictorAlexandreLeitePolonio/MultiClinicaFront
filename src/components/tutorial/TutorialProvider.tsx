"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { TutorialContext } from "@/hooks/tutorial/useTutorial";
import type { ModuleTutorial } from "@/lib/tutorials/tutorial.types";
import { markTutorialCompleted } from "@/lib/tutorials/tutorial.storage";

// Elements from the target module's page may not be mounted yet right after
// navigating there — driver.js polls for up to this long before giving up.
const WAIT_FOR_ELEMENT_MS = 3000;

export function TutorialProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTutorial, setActiveTutorial] = useState<ModuleTutorial | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const driverRef = useRef<Driver | null>(null);

  const startTutorial = useCallback(
    (tutorial: ModuleTutorial) => {
      driverRef.current?.destroy();

      if (pathname !== tutorial.pathname) {
        router.push(tutorial.pathname);
      }

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
        steps: tutorial.steps.map((step) => ({
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
    [pathname, router],
  );

  const value = useMemo(
    () => ({ activeTutorial, isRunning, startTutorial }),
    [activeTutorial, isRunning, startTutorial],
  );

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}
