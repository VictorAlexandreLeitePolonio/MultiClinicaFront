"use client";

import type { MouseEvent, ReactNode } from "react";

const LANDING_HEADER_OFFSET = 88;

interface LandingSmoothLinkProps {
  children: ReactNode;
  className?: string;
  href: `#${string}`;
}

function scrollToSection(target: HTMLElement, hash: string, keyboard: boolean) {
  document.querySelector("details[open]")?.removeAttribute("open");
  window.history.pushState({}, "", hash);
  if (keyboard) {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  window.scrollTo({
    top: Math.max(target.getBoundingClientRect().top + window.scrollY - LANDING_HEADER_OFFSET, 0),
    behavior: keyboard || window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
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
    scrollToSection(target, href, event.detail === 0);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
