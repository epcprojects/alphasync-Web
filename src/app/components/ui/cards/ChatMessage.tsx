"use client";

import ProfileImage from "../ProfileImage";

type ChatMessageProps = {
  sender: string;
  message: string;
  time: string;
  createdAt?: string;
  isUser?: boolean;
  width?: string;
  imageUrl?: string | null;
  senderEmail?: string | null;
};

export default function ChatMessage({
  sender,
  message,
  time,
  createdAt,
  isUser = false,
  width = "min-w-20 w-fit max-w-[75%]",
  imageUrl,
  senderEmail,
}: ChatMessageProps) {
  // Format date and time
  const formatDateTime = () => {
    if (!createdAt) return time;

    const messageDate = new Date(createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if message is today
    const isToday =
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();

    // Check if message is yesterday
    const isYesterday =
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return time;
    } else if (isYesterday) {
      return `Yesterday ${time}`;
    } else {
      // Show date and time for older messages
      const dateStr = messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year:
          messageDate.getFullYear() !== today.getFullYear()
            ? "numeric"
            : undefined,
      });
      return `${dateStr} ${time}`;
    }
  };

  return (
    <div className={` flex ${isUser ? "justify-end " : "justify-start"}`}>
      <div
        className={` ${width}  flex flex-col gap-1.5  ${
          isUser ? "  items-end" : "items-start"
        }`}
      >
        <div className="flex items-center w-full md:gap-3 justify-between gap-1">
          <div className="flex gap-1 md:gap-2 items-center">
            <ProfileImage
              imageUrl={imageUrl}
              fullName={sender}
              width={40}
              height={40}
              className="rounded-full w-full max-h-7 max-w-7 h-full object-cover bg-gray-200"
            />
            <span className="block whitespace-nowrap font-medium text-gray-700 text-xs md:text-sm">
              {sender}
            </span>
          </div>
          <span className="text-gray-500 text-xs block whitespace-nowrap">
            {formatDateTime()}
          </span>
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
