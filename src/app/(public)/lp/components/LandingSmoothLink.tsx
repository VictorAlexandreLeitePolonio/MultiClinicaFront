"use client";

import type { MouseEvent, ReactNode } from "react";

const LANDING_HEADER_OFFSET = 88;

interface LandingSmoothLinkProps {
  children: ReactNode;
  className?: string;
  href: `#${string}`;
}

function scrollToSection(target: HTMLElement, hash: string) {
  const start = window.scrollY;
  const targetPosition = Math.max(
    target.getBoundingClientRect().top + window.scrollY - LANDING_HEADER_OFFSET,
    0,
  );
  const distance = targetPosition - start;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, targetPosition);
    return;
  }

  const duration = Math.min(1400, Math.max(850, Math.abs(distance) * 0.42));
  const startedAt = performance.now();

  const animate = (currentTime: number) => {
    const progress = Math.min((currentTime - startedAt) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 4);

    window.scrollTo(0, start + distance * easedProgress);

    if (progress < 1) {
      window.requestAnimationFrame(animate);
    }
  };

  window.history.pushState({}, "", hash);
  document.querySelector("details[open]")?.removeAttribute("open");
  window.requestAnimationFrame(animate);
}

export function LandingSmoothLink({ children, className, href }: LandingSmoothLinkProps) {
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
    scrollToSection(target, href);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
