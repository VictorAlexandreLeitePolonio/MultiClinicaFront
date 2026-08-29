"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { slideFromLeft, staggerContainer } from "@/lib/motion";
import { AuthMouseRobot, type AuthRobotState } from "./AuthMouseRobot";

interface AuthLayoutProps {
  children: React.ReactNode;
  robotState?: AuthRobotState;
}

export function AuthLayout({ children, robotState = "idle" }: AuthLayoutProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [formFocused, setFormFocused] = useState(false);
  const reduceMotion = useReducedMotion();
  const robotX = useSpring(useMotionValue(0), {
    stiffness: 70,
    damping: 24,
    mass: 0.8,
  });
  const robotY = useSpring(useMotionValue(-230), {
    stiffness: 70,
    damping: 24,
    mass: 0.8,
  });
  const glowX = useSpring(useMotionValue(-240), {
    stiffness: 110,
    damping: 28,
  });
  const glowY = useSpring(useMotionValue(-240), {
    stiffness: 110,
    damping: 28,
  });

  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }

    const setHomePosition = () => {
      const stageRect = stageRef.current?.getBoundingClientRect();
      const formRect = formRef.current?.getBoundingClientRect();

      if (!stageRect) {
        return;
      }

      const isCompact = stageRect.width < 700;
      const homeX = isCompact
        ? Math.min(stageRect.width / 2 - 92, 72)
        : Math.min(Math.max((formRect?.right ?? stageRect.width * 0.67) - stageRect.left - stageRect.width / 2 + 112, 190), stageRect.width / 2 - 78);
      const homeY = isCompact ? -Math.min(stageRect.height * 0.62, 500) : -178;

      robotX.set(homeX);
      robotY.set(homeY);
    };

    setHomePosition();
    window.addEventListener("resize", setHomePosition);

    return () => window.removeEventListener("resize", setHomePosition);
  }, [reduceMotion, robotX, robotY]);

  const updatePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !stageRef.current || formRef.current?.contains(event.target as Node)) {
      return;
    }

    const stageRect = stageRef.current.getBoundingClientRect();
    const formRect = formRef.current?.getBoundingClientRect();
    const pointerX = event.clientX - stageRect.left;
    const pointerY = event.clientY - stageRect.top;
    const horizontalLimit = stageRect.width / 2 - 76;
    const verticalLimit = stageRect.height / 2 - 105;
    let targetX = Math.max(-horizontalLimit, Math.min(pointerX - stageRect.width / 2, horizontalLimit));
    let targetY = Math.max(-verticalLimit, Math.min(pointerY - stageRect.height / 2 - 54, verticalLimit));

    if (formRect) {
      const robotCenterX = stageRect.left + stageRect.width / 2 + targetX;
      const robotCenterY = stageRect.top + stageRect.height / 2 + targetY;
      const isNearForm = robotCenterX > formRect.left - 92 && robotCenterX < formRect.right + 92 && robotCenterY > formRect.top - 105 && robotCenterY < formRect.bottom + 105;

      if (isNearForm) {
        targetX = pointerX < stageRect.width / 2
          ? formRect.left - stageRect.left - stageRect.width / 2 - 118
          : formRect.right - stageRect.left - stageRect.width / 2 + 118;
        targetY = Math.max(-verticalLimit, Math.min(pointerY - stageRect.height / 2 - 54, verticalLimit));
      }
    }

    robotX.set(targetX);
    robotY.set(targetY);
    glowX.set(pointerX - 240);
    glowY.set(pointerY - 240);
  };

  const resetPointer = () => {
    if (reduceMotion) {
      return;
    }

    const stageRect = stageRef.current?.getBoundingClientRect();
    const formRect = formRef.current?.getBoundingClientRect();

    if (!stageRect) {
      return;
    }

    const isCompact = stageRect.width < 700;
    const homeX = isCompact
      ? Math.min(stageRect.width / 2 - 92, 72)
      : Math.min(Math.max((formRect?.right ?? stageRect.width * 0.67) - stageRect.left - stageRect.width / 2 + 112, 190), stageRect.width / 2 - 78);
    const homeY = isCompact ? -Math.min(stageRect.height * 0.62, 500) : -178;

    robotX.set(homeX);
    robotY.set(homeY);
    glowX.set(-240);
    glowY.set(-240);
  };

  const handleFocusCapture = (event: React.FocusEvent<HTMLElement>) => {
    if (formRef.current?.contains(event.target as Node)) {
      setFormFocused(true);
    }
  };

  const handleBlurCapture = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.relatedTarget || !formRef.current?.contains(event.relatedTarget as Node)) {
      setFormFocused(false);
    }
  };

  const activeRobotState = robotState !== "idle" ? robotState : formFocused ? "focus" : "idle";

  return (
    <motion.main
      ref={stageRef}
      variants={slideFromLeft}
      initial="hidden"
      animate="show"
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
      className="auth-login__stage"
    >
      <div className="auth-login__background-grid" aria-hidden="true" />
      <motion.div
        className="auth-login__cursor-glow"
        style={{ x: glowX, y: glowY }}
        aria-hidden="true"
      />
      <div className="auth-login__halo auth-login__halo--one" aria-hidden="true" />
      <div className="auth-login__halo auth-login__halo--two" aria-hidden="true" />
      <AuthMouseRobot state={activeRobotState} x={robotX} y={robotY} />
      <motion.div
        ref={formRef}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        data-auth-form
        className="auth-login__form"
      >
        {children}
      </motion.div>
    </motion.main>
  );
}
