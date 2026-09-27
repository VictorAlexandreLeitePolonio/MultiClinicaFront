"use client";

import {
  AnimatePresence,
  easeInOut,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useState } from "react";
import { RobotAvatar } from "@/components/mascot/RobotAvatar";

const mascotRoute = [
  { progress: 0, x: "-36vw", y: "-38vh", rotation: -8 },
  { progress: 0.14, x: "-10vw", y: "14vh", rotation: 7 },
  { progress: 0.28, x: "34vw", y: "-12vh", rotation: -5 },
  { progress: 0.42, x: "-30vw", y: "16vh", rotation: 8 },
  { progress: 0.58, x: "30vw", y: "-13vh", rotation: -7 },
  { progress: 0.75, x: "-34vw", y: "10vh", rotation: 6 },
  { progress: 0.9, x: "8vw", y: "-15vh", rotation: -4 },
  { progress: 1, x: "32vw", y: "13vh", rotation: -9 },
];

const mascotSpeech = [
  { progress: 0, text: "Oi! Eu sou o lado robô dessa clínica." },
  { progress: 0.2, text: "Tudo conectado. Até meus circuitos gostaram!" },
  { progress: 0.42, text: "Por aqui, a rotina ganha outro ritmo." },
  { progress: 0.62, text: "Mais tempo para cuidar. Essa é a ideia." },
  { progress: 0.8, text: "Bip! Clareza também faz parte do cuidado." },
  { progress: 0.94, text: "Tecnologia com um toque humano. E um aceno meu!" },
];

export function LandingMascot() {
  const [speech, setSpeech] = useState(mascotSpeech[0].text);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothedProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 22,
    mass: 0.8,
    restDelta: 0.001,
  });
  const x = useTransform(
    smoothedProgress,
    mascotRoute.map((stop) => stop.progress),
    mascotRoute.map((stop) => stop.x),
    { ease: easeInOut },
  );
  const y = useTransform(
    smoothedProgress,
    mascotRoute.map((stop) => stop.progress),
    mascotRoute.map((stop) => stop.y),
    { ease: easeInOut },
  );
  const rotate = useTransform(
    smoothedProgress,
    mascotRoute.map((stop) => stop.progress),
    mascotRoute.map((stop) => stop.rotation),
    { ease: easeInOut },
  );

  useMotionValueEvent(smoothedProgress, "change", (progress) => {
    const line = [...mascotSpeech].reverse().find((item) => progress >= item.progress);
    setSpeech(line?.text ?? mascotSpeech[0].text);
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
      data-intro={speech === mascotSpeech[0].text}
      style={reduceMotion ? { x: 0, y: 0 } : { x, y }}
      aria-hidden="true"
    >
      <div className="landing-mascot__float">
        <div className="landing-mascot__speech">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={speech}
              className="landing-mascot__bubble"
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
            >
              {speech}
            </motion.p>
          </AnimatePresence>
        </div>
        <motion.div style={reduceMotion ? undefined : { rotate }}>
          <RobotAvatar className="landing-mascot__robot" />
        </motion.div>
      </div>
      <span className="landing-mascot__shadow" />
    </motion.div>
  );
}
