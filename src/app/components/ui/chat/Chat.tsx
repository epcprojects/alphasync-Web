"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation, useSubscription, useQuery } from "@apollo/client/react";
import { CREATE_CHAT, SEND_MESSAGE } from "@/lib/graphql/mutations";
import { FETCH_ALL_MESSAGES, MESSAGE_ADDED } from "@/lib/graphql/queries";
import { showErrorToast } from "@/lib/toast";
import { ChatMessage, QuickTemplates, ThemeButton } from "@/app/components";
import { useAppSelector } from "@/lib/store/hooks";

interface ChatMessageType {
  id?: string;
  sender: string;
  time: string;
  text: string;
  isUser: boolean;
  imageUrl?: string | null;
  senderEmail?: string | null;
}

interface GraphQLMessage {
  id: string;
  content: string;
  sender?: { id: string; fullName?: string; imageUrl?: string; email?: string };
  user?: { id: string; fullName?: string; imageUrl?: string; email?: string };
  chat?: {
    id: string;
    otherParticipant?: {
      id: string;
      fullName?: string;
      imageUrl?: string;
      email?: string;
    };
  };
  otherParticipant?: {
    id: string;
    fullName?: string;
    imageUrl?: string;
    email?: string;
  };
  createdAt?: string;
}

interface ChatProps {
  participantId: string;
  participantName?: string;
  className?: string;
  templates?: string[];
  onChatCreated?: (chatId: string) => void;
  isModal?: boolean;
}

export default function Chat({
  participantId,
  participantName = "Patient",
  className = "",
  templates = [
    "Your prescription is ready",
    "Please schedule a follow-up",
    "Lab results are available",
    "We have updated your records",
  ],
  onChatCreated,
  isModal,
}: ChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasCreatedChat = useRef(false);

  // Current logged-in user from Redux (auth slice)
  const currentUser = useAppSelector((state) => state.auth?.user);

  // Mutations
  const [createChat] = useMutation(CREATE_CHAT);
  const [sendMessage] = useMutation(SEND_MESSAGE);

  // Map GraphQL message -> local UI type
  const mapGraphQLMessage = useCallback(
    (msg: GraphQLMessage): ChatMessageType => {
      const isCurrentUser =
        msg.user?.id === currentUser?.id ||
        msg.user?.id === String(currentUser?.id) ||
        String(msg.user?.id) === currentUser?.id;

      // Get sender name - if it's current user, show "You", otherwise show the sender's name
      const senderName = isCurrentUser
        ? "You"
        : msg.sender?.fullName ||
          msg.user?.fullName ||
          msg.chat?.otherParticipant?.fullName ||
          msg.otherParticipant?.fullName ||
          participantName;

      // Get sender image and email
      // For current user: use currentUser data
      // For other users: msg.user is the sender (from query), or msg.sender (from subscription)
      const senderImageUrl = isCurrentUser
        ? currentUser?.imageUrl
        : msg.user?.imageUrl || // msg.user is the sender in FETCH_ALL_MESSAGES
          msg.sender?.imageUrl || // msg.sender is from MESSAGE_ADDED subscription
          msg.chat?.otherParticipant?.imageUrl ||
          msg.otherParticipant?.imageUrl;
      const senderEmail = isCurrentUser
        ? currentUser?.email
        : msg.user?.email || // msg.user is the sender in FETCH_ALL_MESSAGES
          msg.sender?.email || // msg.sender is from MESSAGE_ADDED subscription
          msg.chat?.otherParticipant?.email ||
          msg.otherParticipant?.email;

      return {
        id: msg.id,
        sender: senderName,
        time: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
        text: msg.content,
        isUser: isCurrentUser,
        imageUrl: senderImageUrl,
        senderEmail: senderEmail,
      };
    },
    [
      currentUser?.id,
      currentUser?.email,
      currentUser?.imageUrl,
      participantName,
    ]
  );

  // Fetch existing messages
  const { loading: MessageLoading } = useQuery(FETCH_ALL_MESSAGES, {
    variables: { chatId },
    skip: !chatId,
    fetchPolicy: "cache-first",
    onCompleted: (data) => {
      if (data?.fetchAllMessages?.allData) {
        const formatted = data.fetchAllMessages.allData.map(mapGraphQLMessage);
        setMessages(formatted.reverse());
      }
    },
  });

  // Subscription for new messages
  const { data: subscriptionData } = useSubscription(MESSAGE_ADDED, {
    variables: { chatId },
    skip: !chatId,
    fetchPolicy: "no-cache",
    onError: (err) => {
      console.error("Subscription error:", err.message);
    },
  });

  // Add new message from subscription
  useEffect(() => {
    if (subscriptionData?.data?.messageAdded) {
      const newMsg = mapGraphQLMessage(subscriptionData.data.messageAdded);

      setMessages((prev) => {
        // Check if this is a message from current user (replace optimistic update)
        const isCurrentUserMessage = newMsg.isUser;

        if (isCurrentUserMessage) {
          const optimisticIndex = prev.findIndex(
            (msg) =>
              msg.id?.startsWith("temp-") &&
              msg.text === newMsg.text &&
              msg.sender === newMsg.sender
          );

          if (optimisticIndex !== -1) {
            // Replace optimistic message with real message
            const updatedMessages = [...prev];
            updatedMessages[optimisticIndex] = newMsg;
            return updatedMessages;
          }
        }

        // For other users' messages, check for exact ID match
        const exists = prev.some((msg) => msg.id === newMsg.id);
        if (!exists) {
          return [...prev, newMsg];
        }

        return prev;
      });
    }
  }, [subscriptionData, chatId, mapGraphQLMessage]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create chat on mount
  useEffect(() => {
    const createChatOnMount = async () => {
      if (
        !chatId &&
        participantId &&
        !isCreatingChat &&
        !hasCreatedChat.current
      ) {
        hasCreatedChat.current = true;
        setIsCreatingChat(true);
        try {
          const { data } = await createChat({
            variables: { participantId },
          });
          const newChatId = data?.createChat?.chat?.id;
          if (newChatId) {
            setChatId(newChatId);
            onChatCreated?.(newChatId);
          }
        } catch (err) {
          console.error("Failed to create chat:", err);
          showErrorToast("Failed to initialize chat");
          hasCreatedChat.current = false; // Reset on error
        } finally {
          setIsCreatingChat(false);
        }
      }
    };
    createChatOnMount();
  }, [participantId, chatId, isCreatingChat, createChat, onChatCreated]);

  // Handle send
  const handleSend = async (msg: string) => {
    if (!msg.trim() || !chatId || isSendingMessage) return;

    // Add optimistic update for immediate UI feedback
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessageType = {
      id: tempId,
      sender: "You",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: msg,
      isUser: true,
      imageUrl: currentUser?.imageUrl,
      senderEmail: currentUser?.email,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setIsSendingMessage(true);

    try {
      await sendMessage({ variables: { chatId, content: msg } });
    } catch (err) {
      console.error("Failed to send message:", err);
      showErrorToast("Failed to send message");
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 md:gap-3 ${className}`}>
      {isCreatingChat || MessageLoading ? (
        <div className="rounded-2xl border border-gray-200 p-3 h-[470px] flex items-center justify-center">
          <div className="text-gray-500">Initializing chat...</div>
        </div>
      ) : (
        <>
          <div
            className={`rounded-xl sm:rounded-2xl border border-gray-200 p-1.5 sm:p-3  gap-3 ${
              isModal
                ? "flex-1 overflow-y-scroll"
                : "max-h-[430px] min-h-[430px] flex flex-col"
            }`}
          >
            <QuickTemplates
              templates={templates}
              onTemplateClick={handleSend}
            />

            <div
              ref={chatRef}
              className="flex-1 flex flex-col gap-3 overflow-y-auto h-full p-1"
            >
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  sender={msg.sender}
                  time={msg.time}
                  isUser={msg.isUser}
                  message={msg.text}
                  imageUrl={msg.imageUrl}
                  senderEmail={msg.senderEmail}
                />
              ))}
              <div ref={messagesEndRef}></div>
            </div>
          </div>

          <div className="w-full relative flex items-center">
            <input
              placeholder={
                isSendingMessage ? "Sending message..." : "Type your message..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isSendingMessage && handleSend(input)
              }
              disabled={isSendingMessage}
              className="border border-gray-200 h-10 sm:h-12  rounded-full w-full outline-none focus:ring focus:ring-gray-200 placeholder:text-gray-400 ps-4 pe-20 bg-gray-50 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <ThemeButton
              label={isSendingMessage ? "Sending..." : "Send"}
              heightClass="h-8 sm:h-10"
              className="absolute end-1"
              onClick={() => handleSend(input)}
              disabled={!chatId || isSendingMessage}
            />
          </div>
        </>
      )}
    </div>
  );
}
