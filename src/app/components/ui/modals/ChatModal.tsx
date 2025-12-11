import React from "react";
import AppModal from "./AppModal";
import { BubbleChatIcon } from "@/icons";
import Chat from "../chat/Chat";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle?: string;
  participantId: string;
  participantName?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  participantId,
  participantName = "Customer",
}) => {
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
      <Chat
        participantId={participantId}
        participantName={participantName}
        className="min-h-[400px] max-h-[50dvh]"
        isModal={true}
      />
    </AppModal>
  );
};

export default ChatModal;
