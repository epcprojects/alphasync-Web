import React, { useRef, useState } from "react";
import AppModal from "./AppModal";
import { BubbleChatIcon } from "@/icons";
import ChatMessage from "../cards/ChatMessage";
import ThemeButton from "../buttons/ThemeButton";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
  messages: { sender: string; time: string; text: string; isUser: boolean }[];
  onSend: (input: string) => void;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  messages,
  onSend,
}) => {
  const chatRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Chat Messages"
      outSideClickClose={false}
      icon={<BubbleChatIcon fill="#374151" />}
      showFooter={false}
      subtitle={itemTitle ? `Request ID #${itemTitle}` : ""}
      size="medium"
    >
      <div
        className="flex-1 flex flex-col gap-2 overflow-y-auto  h-full min-h-[400px] max-h-[50dvh]"
        ref={chatRef}
      >
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            sender={msg.sender}
            time={msg.time}
            isUser={msg.isUser}
            message={msg.text}
            // width="w-full max-w-lg"
          />
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="w-full relative flex items-center">
        <input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="border border-gray-200 h-12 rounded-full w-full outline-none focus:ring focus:ring-gray-200 placeholder:text-gray-400 ps-4 pe-20 bg-gray-50 text-sm md:text-base"
        />
        <ThemeButton
          label="Send"
          heightClass="h-10"
          className="absolute end-1"
          onClick={handleSend}
        />
      </div>
    </AppModal>
  );
};

export default ChatModal;
