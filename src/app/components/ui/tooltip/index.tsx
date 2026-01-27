"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import React, { useEffect, useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  className?: string;
  autoShowOnceKey?: string;
  autoHideAfter?: number;
}

export default function Tooltip({
  content,
  children,
  side = "top",
  sideOffset = 8,
  className = "",
  autoShowOnceKey,
  autoHideAfter = 10000,
}: TooltipProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!autoShowOnceKey) return;

    try {
      const alreadyShown = localStorage.getItem(autoShowOnceKey) === "1";
      if (alreadyShown) return;

      // Show now
      setOpen(true);

      // Mark as shown immediately (so even if user reloads quickly, it won't keep popping)
      localStorage.setItem(autoShowOnceKey, "1");

      const timer = setTimeout(() => setOpen(false), autoHideAfter);
      return () => clearTimeout(timer);
    } catch {
      // If localStorage blocked (privacy mode), just don't auto-show
      return;
    }
  }, [autoShowOnceKey, autoHideAfter]);
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root open={open} onOpenChange={setOpen} delayDuration={0}>
        <RadixTooltip.Trigger asChild>
          <span>{children}</span>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={sideOffset}
            className={`px-3 py-2 text-xs max-w-60 font-semibold text-white bg-black rounded-lg shadow-lg z-[500] select-none ${className}`}
          >
            {content}
            <RadixTooltip.Arrow className="fill-black" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
