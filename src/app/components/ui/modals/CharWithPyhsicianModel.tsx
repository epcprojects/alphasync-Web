import AppModal, { ModalPosition } from "./AppModal";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { BubbleChatIcon } from "@/icons";
import Chat from "../chat/Chat";

const CUSTOMER_QUICK_TEMPLATES = [
  "I have a question about my prescription",
  "Can you explain my test results?",
  "I need to schedule a follow-up",
  "I'm experiencing side effects",
];

const DOCTOR_QUICK_TEMPLATES = [
  "Your prescription is ready",
  "Please schedule a follow-up",
  "Lab results are available",
  "We have updated your records",
];

interface ChatWithPhysicianProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string;
  participantName?: string;
  itemTitle?: string;
  userType?: "customer" | "doctor";
}

const ChatWithPhysician: React.FC<ChatWithPhysicianProps> = ({
  isOpen,
  onClose,
  participantId,
  participantName = "Physician",
  itemTitle,
  userType = "customer",
}) => {
  useBodyScrollLock(isOpen);
  const templates =
    userType === "doctor" ? DOCTOR_QUICK_TEMPLATES : CUSTOMER_QUICK_TEMPLATES;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<BubbleChatIcon fill="#000" />}
      title="Chat with Your Physician"
      outSideClickClose={false}
      subtitle={
        itemTitle ? `Request ID #${itemTitle}` : "Follow up about your request"
      }
      position={ModalPosition.RIGHT}
      showFooter={false}
    >
      <div className="h-full">
        <Chat
        participantId={participantId}
        participantName={participantName}
          className="h-full!"
          templates={templates}
          isModal={true}
      />
      </div>
    </AppModal>
  );
};

export default ChatWithPhysician;
