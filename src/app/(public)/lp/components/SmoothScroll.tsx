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

  useEffect(() => {
    let frame = 0;
    let stopStabilizing = () => {};

    const scrollToHash = () => {
      stopStabilizing();

      const { hash } = window.location;
      if (!hash) return;

      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;

      const applyScroll = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (lenis) {
            lenis.scrollTo(target, { offset: 0, immediate: true });
            return;
          }

          target.scrollIntoView({ behavior: "auto", block: "start" });
        });
      };

      // O bloco fixo das funcionalidades e o carregamento dos planos alteram a
      // altura do documento: recalcula e reaplica a âncora enquanto o layout assenta.
      if (lenis) ScrollTrigger.refresh();
      applyScroll();

      const observer =
        typeof ResizeObserver === "function"
          ? new ResizeObserver(applyScroll)
          : null;
      observer?.observe(document.body);

      const timeout = window.setTimeout(() => stopStabilizing(), 3000);
      const stop = () => stopStabilizing();

      stopStabilizing = () => {
        cancelAnimationFrame(frame);
        observer?.disconnect();
        window.clearTimeout(timeout);
        window.removeEventListener("wheel", stop);
        window.removeEventListener("touchstart", stop);
        window.removeEventListener("pointerdown", stop);
        window.removeEventListener("keydown", stop);
      };

      window.addEventListener("wheel", stop, { passive: true });
      window.addEventListener("touchstart", stop, { passive: true });
      window.addEventListener("pointerdown", stop, { passive: true });
      window.addEventListener("keydown", stop);
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.removeEventListener("hashchange", scrollToHash);
      stopStabilizing();
    };
  }, [lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
