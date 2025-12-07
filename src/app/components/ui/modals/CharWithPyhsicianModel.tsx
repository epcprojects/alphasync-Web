import AppModal, { ModalPosition } from "./AppModal";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { BubbleChatIcon } from "@/icons";
import Chat from "../chat/Chat";

interface ChatWithPhysicianProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string;
  participantName?: string;
  itemTitle?: string;
}

const ChatWithPhysician: React.FC<ChatWithPhysicianProps> = ({
  isOpen,
  onClose,
  participantId,
  participantName = "Physician",
  itemTitle,
}) => {
  useBodyScrollLock(isOpen);
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
      <Chat
        participantId={participantId}
        participantName={participantName}
        className="min-h-[400px] max-h-[50dvh]"
      />
    </AppModal>
  );
};

export default ChatWithPhysician;
