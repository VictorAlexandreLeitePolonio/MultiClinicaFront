"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerLpGsap } from "./features/lpGsap";

const LenisContext = createContext<Lenis | null>(null);

let instance: Lenis | null = null;
const listeners = new Set<() => void>();

function subscribeLenis(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getLenisSnapshot() {
  return instance;
}

function getServerLenisSnapshot() {
  return null;
}

function setLenis(next: Lenis | null) {
  if (instance === next) return;
  instance = next;
  listeners.forEach((listener) => listener());
}

/** Instância do Lenis da LP; `null` no servidor, antes da hidratação ou com reduced motion. */
export function useLenis() {
  return useContext(LenisContext);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion() === true;
  const lenis = useSyncExternalStore(subscribeLenis, getLenisSnapshot, getServerLenisSnapshot);

  useEffect(() => {
    if (reduce) return;

    registerLpGsap();

    const scroller = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      autoRaf: false,
      respectReducedMotion: true,
    });

    const stopScroll = scroller.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => scroller.raf(time * 1000);

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(scroller);

    return () => {
      stopScroll();
      gsap.ticker.remove(raf);
      scroller.destroy();
      setLenis(null);
    };
  }, [reduce]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
