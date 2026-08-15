"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useState } from "react";
import { RobotAvatar } from "@/components/mascot/RobotAvatar";

type MascotAnchor = "hero" | "modulos" | "rotina" | "faq" | "contato";

const mascotMessages: Record<MascotAnchor, string> = {
  hero: "Eu vou te mostrar o caminho.",
  modulos: "Clique em um card para explorar.",
  rotina: "Olha esse passo da rotina.",
  faq: "Tem alguma dúvida? Eu te acompanho.",
  contato: "Pronto para conhecer por dentro?",
};

const mascotRoute = [
  { progress: 0, anchor: "hero" as const, x: "-42vw", y: "-40vh", rotation: -8 },
  { progress: 0.14, anchor: "hero" as const, x: "-10vw", y: "14vh", rotation: 7 },
  { progress: 0.28, anchor: "modulos" as const, x: "34vw", y: "-12vh", rotation: -5 },
  { progress: 0.42, anchor: "rotina" as const, x: "-30vw", y: "16vh", rotation: 8 },
  { progress: 0.58, anchor: "rotina" as const, x: "30vw", y: "-13vh", rotation: -7 },
  { progress: 0.75, anchor: "faq" as const, x: "-34vw", y: "10vh", rotation: 6 },
  { progress: 0.9, anchor: "faq" as const, x: "8vw", y: "-15vh", rotation: -4 },
  { progress: 1, anchor: "contato" as const, x: "38vw", y: "13vh", rotation: -9 },
];

function getMascotAnchor(progress: number): MascotAnchor {
  let currentAnchor: MascotAnchor = mascotRoute[0].anchor;

  mascotRoute.forEach((stop) => {
    if (progress >= stop.progress) {
      currentAnchor = stop.anchor;
    }
  });

  return currentAnchor;
}

export function LandingMascot() {
  const [anchor, setAnchor] = useState<MascotAnchor>("hero");
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothedProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const x = useTransform(
    smoothedProgress,
    mascotRoute.map((stop) => stop.progress),
    mascotRoute.map((stop) => stop.x),
  );
  const y = useTransform(
    smoothedProgress,
    mascotRoute.map((stop) => stop.progress),
    mascotRoute.map((stop) => stop.y),
  );
  const rotate = useTransform(
    smoothedProgress,
    mascotRoute.map((stop) => stop.progress),
    mascotRoute.map((stop) => stop.rotation),
  );

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const nextAnchor = getMascotAnchor(progress);
    setAnchor((currentAnchor) => currentAnchor === nextAnchor ? currentAnchor : nextAnchor);
  });

  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-landing-reveal]"),
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.dataset.visible = "true";
            revealObserver.unobserve(target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    revealTargets.forEach((target) => {
      target.dataset.revealReady = "true";
      target.dataset.visible = "false";
      revealObserver.observe(target);
    });

    return () => {
      revealObserver.disconnect();
    };
  }, []);

  return (
    <motion.div
      className="landing-mascot"
      data-anchor={anchor}
      style={reduceMotion ? { x: 0, y: 0, rotate: 0 } : { x, y, rotate }}
      aria-hidden="true"
    >
      <div className="landing-mascot__bubble">{mascotMessages[anchor]}</div>
      <RobotAvatar className="landing-mascot__robot" />
      <span className="landing-mascot__shadow" />
    </motion.div>
  );
}
