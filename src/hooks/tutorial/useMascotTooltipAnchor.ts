"use client";

import { useEffect, useState } from "react";

interface TooltipAnchor {
  x: number;
  y: number;
}

// ponytail: tracks driver.js's popover via MutationObserver instead of polling.
// Driver.js recreates the .driver-popover element on every step, so we also
// watch document.body for that element reappearing.
export function useMascotTooltipAnchor(isRunning: boolean): TooltipAnchor | null {
  const [anchor, setAnchor] = useState<TooltipAnchor | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    let styleObserver: MutationObserver | null = null;

    const readAnchor = () => {
      const popover = document.querySelector<HTMLElement>(".driver-popover");
      if (!popover) return;
      const rect = popover.getBoundingClientRect();
      setAnchor({ x: rect.left, y: rect.bottom + 16 });
    };

    const observePopover = (popover: HTMLElement) => {
      styleObserver?.disconnect();
      styleObserver = new MutationObserver(readAnchor);
      styleObserver.observe(popover, { attributes: true, attributeFilter: ["style"] });
      readAnchor();
    };

    const existingPopover = document.querySelector<HTMLElement>(".driver-popover");
    if (existingPopover) observePopover(existingPopover);

    const bodyObserver = new MutationObserver(() => {
      const popover = document.querySelector<HTMLElement>(".driver-popover");
      if (popover) observePopover(popover);
    });
    bodyObserver.observe(document.body, { childList: true });

    return () => {
      styleObserver?.disconnect();
      bodyObserver.disconnect();
    };
  }, [isRunning]);

  return isRunning ? anchor : null;
}
