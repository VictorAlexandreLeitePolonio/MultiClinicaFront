"use client";

import { motion, useReducedMotion, type MotionValue } from "motion/react";
import { RobotAvatar } from "@/components/mascot/RobotAvatar";

export type AuthRobotState = "idle" | "focus" | "loading" | "error" | "success";

interface AuthMouseRobotProps {
  state: AuthRobotState;
  x: MotionValue<number>;
  y: MotionValue<number>;
}

const stateCopy: Record<AuthRobotState, string> = {
  idle: "Estou por aqui.",
  focus: "Atenção total.",
  loading: "Conferindo...",
  error: "Vamos tentar de novo.",
  success: "Tudo certo!",
};

const stateMotion: Record<AuthRobotState, { rotate: number; scale: number; y: number }> = {
  idle: { rotate: -7, scale: 1, y: 0 },
  focus: { rotate: 7, scale: 1.05, y: -5 },
  loading: { rotate: 0, scale: 1.08, y: -8 },
  error: { rotate: -14, scale: 0.96, y: 2 },
  success: { rotate: 10, scale: 1.1, y: -10 },
};

export function AuthMouseRobot({ state, x, y }: AuthMouseRobotProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="auth-login__robot-position"
      style={{ x, y }}
      aria-hidden="true"
    >
      <motion.div
        className="auth-login__robot-companion"
        animate={reduceMotion ? { rotate: 0, scale: 1, y: 0 } : stateMotion[state]}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <div className="auth-login__robot-bubble">{stateCopy[state]}</div>
        <RobotAvatar className="auth-login__robot-figure" />
        <span className="auth-login__robot-shadow" />
      </motion.div>
    </motion.div>
  );
}
