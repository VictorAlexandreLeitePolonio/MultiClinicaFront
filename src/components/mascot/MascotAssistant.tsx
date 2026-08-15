"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RobotAvatar } from "@/components/mascot/RobotAvatar";
import { MascotBubble } from "@/components/mascot/MascotBubble";
import { MascotMenu, type MascotMenuTaskItem } from "@/components/mascot/MascotMenu";
import { TutorialCatalog } from "@/components/tutorial/TutorialCatalog";
import { useAuth } from "@/contexts/AuthContext";
import { useTutorial } from "@/hooks/tutorial/useTutorial";
import { useMascotTooltipAnchor } from "@/hooks/tutorial/useMascotTooltipAnchor";
import { getTasksForModule, resolveTutorialByPathname } from "@/lib/tutorials/tutorial.registry";
import {
  hasSeenTutorialInvite,
  isTaskCompleted,
  isTutorialCompleted,
  markTutorialInviteSeen,
} from "@/lib/tutorials/tutorial.storage";
import type { ModuleTutorial, TaskTutorial } from "@/lib/tutorials/tutorial.types";

const FLIP_DURATION_MS = 600;

export function MascotAssistant() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const { user, can } = useAuth();
  const { isRunning, startTutorial } = useTutorial();
  const tooltipAnchor = useMascotTooltipAnchor(isRunning);
  // driver.js destroys and recreates its popover on every step — the anchor
  // hook briefly reports null in that gap. Hold the last known position
  // instead of snapping back to the corner (0,0) each time. Adjusted during
  // render (not an effect) — React's documented pattern for derived state.
  const [displayAnchor, setDisplayAnchor] = useState<{ x: number; y: number } | null>(null);
  const [prevTooltipAnchor, setPrevTooltipAnchor] = useState(tooltipAnchor);
  if (tooltipAnchor !== prevTooltipAnchor) {
    setPrevTooltipAnchor(tooltipAnchor);
    if (tooltipAnchor) {
      setDisplayAnchor(tooltipAnchor);
    } else if (!isRunning) {
      setDisplayAnchor(null);
    }
  }

  const [inviteTutorial, setInviteTutorial] = useState<ModuleTutorial | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const moduleTutorial = resolveTutorialByPathname(pathname ?? "");

  // ponytail: reset menu/invite during render (not in an effect) when the
  // route changes — React's documented pattern for "adjust state on prop change".
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setInviteTutorial(null);
  }

  useEffect(() => {
    if (!moduleTutorial) return;
    if (isTutorialCompleted(moduleTutorial.id)) return;
    if (hasSeenTutorialInvite(moduleTutorial.id)) return;

    const timer = window.setTimeout(() => {
      markTutorialInviteSeen(moduleTutorial.id);
      setInviteTutorial(moduleTutorial);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [moduleTutorial]);

  const handleAvatarClick = () => {
    setInviteTutorial(null);
    if (reducedMotion) {
      setMenuOpen((open) => !open);
      return;
    }
    setIsFlipping(true);
    window.setTimeout(() => {
      setIsFlipping(false);
      setMenuOpen((open) => !open);
    }, FLIP_DURATION_MS);
  };

  const handleSelectTutorial = (tutorial: ModuleTutorial | TaskTutorial) => {
    setMenuOpen(false);
    setCatalogOpen(false);
    startTutorial(tutorial);
  };

  const taskItems: MascotMenuTaskItem[] = moduleTutorial
    ? getTasksForModule(moduleTutorial.id, user?.role, can).map((task) => ({
        id: task.id,
        label: isTaskCompleted(task.moduleId, task.id) ? `Rever: ${task.title}` : task.title,
        onClick: () => handleSelectTutorial(task),
      }))
    : [];

  if (isRunning) {
    return (
      <motion.div
        className="fixed z-[80]"
        animate={
          reducedMotion
            ? { opacity: 1 }
            : { left: displayAnchor?.x ?? 0, top: displayAnchor?.y ?? 0, opacity: displayAnchor ? 1 : 0 }
        }
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <RobotAvatar />
      </motion.div>
    );
  }

  const avatarAnimate = reducedMotion
    ? { opacity: 1 }
    : isFlipping
      ? { y: [0, -18, 0], rotate: [0, 360], scale: [1, 1.05, 1] }
      : inviteTutorial
        ? { y: [0, -10, 0], rotate: [0, -8, 8, 0] }
        : { y: [0, -8, 0] };

  const avatarTransition = reducedMotion
    ? { duration: 0.2 }
    : isFlipping
      ? { duration: FLIP_DURATION_MS / 1000, ease: "easeInOut" as const }
      : inviteTutorial
        ? { duration: 0.7, ease: "easeOut" as const }
        : { duration: 2.6, repeat: Infinity, ease: "easeInOut" as const };

  const completed = moduleTutorial ? isTutorialCompleted(moduleTutorial.id) : false;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {inviteTutorial && !menuOpen && (
          <MascotBubble
            moduleTitle={inviteTutorial.title}
            onStart={() => handleSelectTutorial(inviteTutorial)}
            onDismiss={() => setInviteTutorial(null)}
          />
        )}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>
          {menuOpen && (
            <MascotMenu
              contextualLabel={
                moduleTutorial
                  ? completed
                    ? `Rever tutorial da ${moduleTutorial.title}`
                    : `Conhecer ${moduleTutorial.title}`
                  : undefined
              }
              onContextual={
                moduleTutorial ? () => handleSelectTutorial(moduleTutorial) : undefined
              }
              taskItems={taskItems}
              onOpenCatalog={() => {
                setMenuOpen(false);
                setCatalogOpen(true);
              }}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-label="Assistente virtual"
          onClick={handleAvatarClick}
          animate={avatarAnimate}
          transition={avatarTransition}
        >
          <RobotAvatar />
        </motion.button>
      </div>

      <TutorialCatalog
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onSelect={handleSelectTutorial}
      />
    </div>
  );
}
