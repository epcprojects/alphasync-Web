"use client";
import { ChatMessage, ThemeButton } from "@/app/components";
import { getInitials } from "@/lib/helpers";
import React, { useEffect, useRef, useState } from "react";

const Page = () => {
  const [messages, setMessages] = useState<
    { sender: string; time: string; text: string; isUser: boolean }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const [input, setInput] = useState("");
  const [toggle, setToggle] = useState(true);
  const handleSend = (msg: string) => {
    if (!msg.trim()) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        sender: toggle ? "You" : "John Smith",
        time,
        text: msg,
        isUser: toggle,
      },
    ]);
    setToggle(!toggle);
    setInput("");
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="bg-white w-full rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <div className="p-3 md:p-4 lg:p-6 border-b border-b-gray-200 flex items-center gap-3 md:gap-5">
          <div className="rounded-full h-10 w-10 text-red-600 bg-red-100 text-sm md:text-2xl lg:text-3xl font-medium flex items-center justify-center shrink-0 md:h-14 md:w-14 lg:w-19 lg:h-19">
            {getInitials("Sarah Wilson")}
            {/* <Image
                          alt=""
                          width={256}
                          height={256}
                          src={"/images/arinaProfile.png"}
                          className="rounded-full w-full h-full"
                        /> */}
          </div>
          <div>
            <div className="flex items-center gap-1 md:gap-2">
              <h2 className="text-slate-900 text-sm md:text-lg font-semibold">
                Dr. Sarah Wilson
              </h2>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium bg-green-50 text-green-700 border border-green-200`}
              >
                Active
              </span>
            </div>
            <h2 className="text-xs md:text-sm text-gray-600 font-normal">
              Internal Medicine
            </h2>
          </div>
        </div>

        <div className="overflow-hidden flex flex-col gap-2  p-1.5 md:p-3 max-h-[470px]  min-h-[470px]">
          <div
            className="flex-1 flex flex-col gap-2 overflow-y-auto h-full"
            ref={chatRef}
          >
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                sender={msg.sender}
                time={msg.time}
                isUser={msg.isUser}
                message={msg.text}
                // width="min-w-[90%] max-w-[90%] sm:min-w-[60%] sm:max-w-[60%]"
              />
            ))}
            <div ref={messagesEndRef}></div>
          </div>
          <div className="w-full relative flex items-center">
            <input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              className="border border-gray-200 h-12 rounded-full w-full outline-none focus:ring focus:ring-gray-200 placeholder:text-gray-400 ps-4 pe-20 bg-gray-50 text-sm md:text-base"
            />
            <ThemeButton
              label="Send"
              heightClass="h-10"
              className="absolute end-1"
              onClick={() => handleSend(input)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
