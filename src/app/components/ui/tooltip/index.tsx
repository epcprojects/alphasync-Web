"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import React, { useEffect, useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  className?: string;
  autoShowOnLoad?: boolean;
  autoHideAfter?: number;
}

export default function Tooltip({
  content,
  children,
  side = "top",
  sideOffset = 8,
  className = "",
  autoShowOnLoad = false,
  autoHideAfter = 10000,
}: TooltipProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!autoShowOnLoad) return;

    setOpen(true);

    const timer = setTimeout(() => {
      setOpen(false);
    }, autoHideAfter);

    return () => clearTimeout(timer);
  }, [autoShowOnLoad, autoHideAfter]);
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
