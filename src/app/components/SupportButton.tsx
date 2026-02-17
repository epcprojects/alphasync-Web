"use client";

import React, { useState } from "react";
import { BubbleChatIcon } from "@/icons";

const SUPPORT_PHONE_DISPLAY = "(888) 919-5097";
const SUPPORT_PHONE_TEL = "+18889195097"; // E.164 for tel: link
const SUPPORT_EMAIL = "support@alphasyncrx.com";

export default function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close support"
          className="fixed inset-0 z-[9998] cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
        {isOpen && (
          <div
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg ring-1 ring-black/5 min-w-[260px]"
            role="dialog"
            aria-label="Support contact information"
          >
          <p className="text-sm font-medium text-gray-900 mb-3">
            Need Help? Contact us here:
          </p>
          <a
            href={`tel:${SUPPORT_PHONE_TEL}`}
            className="block text-primary font-semibold text-sm hover:underline mb-1 cursor-pointer"
          >
            {SUPPORT_PHONE_DISPLAY}
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-primary font-semibold text-sm hover:underline break-all cursor-pointer"
          >
            {SUPPORT_EMAIL}
          </a>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          aria-label={isOpen ? "Close support" : "Open support contact"}
        >
          <BubbleChatIcon width="24" height="24" fill="currentColor" />
        </button>
      </div>
    </>
  );
}
