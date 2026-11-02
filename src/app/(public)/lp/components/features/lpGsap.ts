import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease } from "@/lib/motion";

let registered = false;
let easeOut: ReturnType<typeof CustomEase.create> | undefined;

/** Registra os plugins da LP uma única vez (idempotente). Só use no cliente. */
export function registerLpGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  registered = true;
}

/**
 * `ease.out` do sistema como curva do GSAP, para o scroll da LP usar a mesma
 * aceleração do resto da interface.
 */
export function getLpEaseOut() {
  if (easeOut) return easeOut;

  registerLpGsap();
  const [x1, y1, x2, y2] = ease.out;
  easeOut = CustomEase.create("lp-ease-out", `M0,0 C${x1},${y1} ${x2},${y2} 1,1`);
  return easeOut;
}
