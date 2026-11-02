"use client";

import type { MouseEvent, ReactNode } from "react";
import { useLenis } from "./SmoothScroll";

const LANDING_HEADER_OFFSET = 88;
const LENIS_HEADER_OFFSET = -72;

interface LandingSmoothLinkProps {
  children: ReactNode;
  className?: string;
  href: `#${string}`;
}

export function LandingSmoothLink({ children, className, href }: LandingSmoothLinkProps) {
  const lenis = useLenis();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const target = document.querySelector<HTMLElement>(href);

    if (!target) {
      return;
    }

    event.preventDefault();

    const keyboard = event.detail === 0;
    document.querySelector("details[open]")?.removeAttribute("open");
    window.history.pushState({}, "", href);

    if (keyboard) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }

    if (lenis) {
      lenis.scrollTo(target, { offset: LENIS_HEADER_OFFSET, immediate: keyboard });
      return;
    }

    window.scrollTo({
      top: Math.max(
        target.getBoundingClientRect().top + window.scrollY - LANDING_HEADER_OFFSET,
        0,
      ),
      behavior:
        keyboard || window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
    });
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
