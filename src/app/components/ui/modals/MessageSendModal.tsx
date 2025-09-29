import React, { useState } from "react";
import AppModal from "./AppModal";
import { BubbleChatIcon } from "@/icons";
import TextAreaField from "../inputs/TextAreaField";

interface MessageSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { msg: string }) => void;
  userName: string;
  orderId: string;
}

const MessageSendModal: React.FC<MessageSendModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  orderId,
}) => {
  const [msg, setMessage] = useState("");

  const handleClose = () => {
    onClose();
    setMessage("");
  };

  const handleConfirm = () => {
    if (msg.trim()) {
      onConfirm({ msg });
      setMessage("");
      onClose();
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Chat with Patient"
      subtitle={`Send a message to ${userName} about their request ${orderId}`}
      onConfirm={handleConfirm}
      outSideClickClose={false}
      confirmLabel="Send Message"
      icon={<BubbleChatIcon fill="#374151" />}
      confimBtnDisable={!msg.trim()}
    >
      <TextAreaField
        label="Message"
        value={msg}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message to the patient..."
      />
    </AppModal>
  );
};

export default MessageSendModal;
