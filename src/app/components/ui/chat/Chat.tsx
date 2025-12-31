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
  createdAt?: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesTopRef = useRef<HTMLDivElement | null>(null);
  const hasCreatedChat = useRef(false);
  const scrollHeightBeforeLoad = useRef<number>(0);
  const hasScrolledToBottom = useRef(false);

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
        createdAt: msg.createdAt,
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

  // Fetch existing messages (initial load)
  const {
    loading: MessageLoading,
    refetch: refetchMessages,
    data: messagesData,
  } = useQuery(FETCH_ALL_MESSAGES, {
    variables: { chatId, page: 1, perPage: 20 },
    skip: !chatId,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log("Initial messages loaded:", {
        count: data?.fetchAllMessages?.allData?.length,
        totalPages: data?.fetchAllMessages?.totalPages,
        nextPage: data?.fetchAllMessages?.nextPage,
      });
      if (data?.fetchAllMessages?.allData) {
        const formatted = data.fetchAllMessages.allData.map(mapGraphQLMessage);
        setMessages(formatted.reverse());
        setCurrentPage(1);
        // Check if there are more pages (older messages) to load
        const pages = data.fetchAllMessages.totalPages ?? 1;
        setTotalPages(pages);
        const hasMore = pages > 1;
        console.log(
          "Setting hasMoreMessages:",
          hasMore,
          "totalPages:",
          pages,
          "prevPage:",
          data.fetchAllMessages.prevPage
        );
        setHasMoreMessages(hasMore);
        // Reset scroll flag for initial load
        hasScrolledToBottom.current = false;
      }
    },
  });

  // Also handle data changes from the query directly (fallback)
  useEffect(() => {
    if (
      messagesData?.fetchAllMessages &&
      currentPage === 1 &&
      messages.length === 0
    ) {
      const data = messagesData.fetchAllMessages;
      if (data.allData) {
        const formatted = data.allData.map(mapGraphQLMessage);
        setMessages(formatted.reverse());
        const pages = data.totalPages ?? 1;
        setTotalPages(pages);
        setHasMoreMessages(pages > 1);
        // Reset scroll flag for initial load
        hasScrolledToBottom.current = false;
      }
    }
  }, [messagesData, mapGraphQLMessage, currentPage, messages.length]);

  // Load more messages when scrolling to top
  const loadMoreMessages = useCallback(async () => {
    if (!chatId || isLoadingMore || !hasMoreMessages) {
      console.log("Skipping loadMoreMessages:", {
        chatId: !!chatId,
        isLoadingMore,
        hasMoreMessages,
      });
      return;
    }

    setIsLoadingMore(true);
    const nextPage = currentPage + 1; // Load next page (older messages)
    console.log("Loading page:", nextPage, "Current page:", currentPage);

    try {
      const { data } = await refetchMessages({
        chatId,
        page: nextPage,
        perPage: 20,
      });

      console.log("Fetched messages data:", {
        hasData: !!data?.fetchAllMessages?.allData,
        count: data?.fetchAllMessages?.allData?.length,
        totalPages: data?.fetchAllMessages?.totalPages,
        nextPage: data?.fetchAllMessages?.nextPage,
        prevPage: data?.fetchAllMessages?.prevPage,
      });

      if (
        data?.fetchAllMessages?.allData &&
        data.fetchAllMessages.allData.length > 0
      ) {
        const formatted = data.fetchAllMessages.allData.map(mapGraphQLMessage);
        const olderMessages = formatted.reverse();

        // Store scroll position before adding new messages
        if (chatRef.current) {
          scrollHeightBeforeLoad.current = chatRef.current.scrollHeight;
        }

        // Prepend older messages to existing messages
        setMessages((prev) => {
          // Avoid duplicates by checking IDs
          const existingIds = new Set(prev.map((m: ChatMessageType) => m.id));
          const newMessages = olderMessages.filter(
            (m: ChatMessageType) => !existingIds.has(m.id)
          );
          return [...newMessages, ...prev];
        });

        // Update pagination state
        const pages = data.fetchAllMessages.totalPages ?? totalPages;
        setTotalPages(pages);
        setCurrentPage(nextPage);

        // Check if there are more pages to load
        // Use prevPage if available, otherwise check if currentPage < totalPages
        const prevPage = data.fetchAllMessages.prevPage;
        const hasMore =
          prevPage !== null && prevPage > 0 ? true : nextPage < pages;

        console.log("Updated pagination:", {
          currentPage: nextPage,
          totalPages: pages,
          prevPage,
          hasMore,
          condition: `nextPage (${nextPage}) < pages (${pages}) = ${
            nextPage < pages
          }`,
        });
        setHasMoreMessages(hasMore);
      } else {
        // No more messages to load
        console.log("No more messages to load");
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
      showErrorToast("Failed to load older messages");
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    chatId,
    isLoadingMore,
    hasMoreMessages,
    currentPage,
    totalPages,
    refetchMessages,
    mapGraphQLMessage,
  ]);

  // Restore scroll position after loading older messages
  useEffect(() => {
    if (chatRef.current && scrollHeightBeforeLoad.current > 0) {
      const newScrollHeight = chatRef.current.scrollHeight;
      const scrollDifference = newScrollHeight - scrollHeightBeforeLoad.current;
      chatRef.current.scrollTop = scrollDifference;
      scrollHeightBeforeLoad.current = 0;
    }
  }, [messages]);

  // Handle scroll to top for loading more messages
  useEffect(() => {
    const chatElement = chatRef.current;
    if (!chatElement || !chatId) return;

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      // Clear any existing timeout
      clearTimeout(scrollTimeout);

      // Debounce scroll events
      scrollTimeout = setTimeout(() => {
        if (!chatElement) return;

        // Check if scrolled to top (within 50px threshold)
        const isNearTop = chatElement.scrollTop <= 50;

        if (isNearTop && hasMoreMessages && !isLoadingMore) {
          console.log("Loading more messages...", {
            currentPage,
            hasMoreMessages,
            scrollTop: chatElement.scrollTop,
          });
          loadMoreMessages();
        }
      }, 100);
    };

    chatElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(scrollTimeout);
      chatElement.removeEventListener("scroll", handleScroll);
    };
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages, chatId, currentPage]);

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

  // Scroll to bottom on initial load (when messages are first loaded)
  useEffect(() => {
    if (
      messages.length > 0 &&
      !hasScrolledToBottom.current &&
      !isLoadingMore &&
      !MessageLoading
    ) {
      // Use requestAnimationFrame and setTimeout to ensure DOM is fully updated
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (chatRef.current) {
            // Directly set scroll position to bottom
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
            hasScrolledToBottom.current = true;
            console.log("Scrolled to bottom on initial load");
          }
        }, 150);
      });
    }
  }, [messages.length, isLoadingMore, MessageLoading]);

  // Auto-scroll on new message (only when messages are added at the end, not when loading older messages)
  const previousMessagesLength = useRef(messages.length);
  useEffect(() => {
    // Only auto-scroll if a new message was added at the end (not when loading older messages at the top)
    if (
      messages.length > previousMessagesLength.current &&
      !isLoadingMore &&
      hasScrolledToBottom.current
    ) {
      const wasAtBottom =
        chatRef.current &&
        chatRef.current.scrollHeight - chatRef.current.scrollTop <=
          chatRef.current.clientHeight + 100; // Within 100px of bottom

      // Only scroll if user was already at bottom
      if (wasAtBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      }
    }
    previousMessagesLength.current = messages.length;
  }, [messages, isLoadingMore]);

  // Reset pagination when chatId changes
  useEffect(() => {
    if (chatId) {
      setCurrentPage(1);
      setTotalPages(1);
      setHasMoreMessages(true);
      setMessages([]);
      hasScrolledToBottom.current = false;
    }
  }, [chatId]);

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
    const now = new Date();
    const optimisticMessage: ChatMessageType = {
      id: tempId,
      sender: "You",
      time: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: now.toISOString(),
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
              {isLoadingMore && (
                <div className="flex justify-center py-2 text-gray-500 text-sm">
                  Loading older messages...
                </div>
              )}
              <div ref={messagesTopRef}></div>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  sender={msg.sender}
                  time={msg.time}
                  createdAt={msg.createdAt}
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
