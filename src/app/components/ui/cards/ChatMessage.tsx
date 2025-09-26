"use client";

import { getInitials } from "@/lib/helpers";
import Image from "next/image";

type ChatMessageProps = {
  sender: string;
  message: string;
  time: string;
  isUser?: boolean;
  width?: string;
};

export default function ChatMessage({
  sender,
  message,
  time,
  isUser = false,
  width = "min-w-lg max-w-lg",
}: ChatMessageProps) {
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`${width} w-full flex flex-col gap-1.5`}>
        <div className="flex items-center justify-between gap-1">
          <div className="flex gap-1 md:gap-2 items-center">
            {!isUser && (
              <span className="bg-red-100 text-red-600 h-7 w-7 justify-center font-medium rounded-full text-xs shrink-0  flex items-center">
                {getInitials(sender)}
              </span>
            )}
            <Image
              alt=""
              width={256}
              height={256}
              src={"/images/reviewImage1.jpg"}
              className="rounded-full w-full max-h-7 max-w-7 h-full"
            />
            <span className="block whitespace-nowrap font-medium text-gray-700 text-xs md:text-sm">
              {sender}
            </span>
          </div>
          <span className="text-gray-500 text-xs block">{time}</span>
        </div>

        <div
          className={`border border-gray-200 text-gray-900 text-sm md:text-base rounded-xl py-1 md:py-2 px-1.5 md:px-3 ${
            isUser ? "rounded-tr-none bg-white" : "rounded-tl-none bg-gray-50"
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
