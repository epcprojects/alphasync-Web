import AppModal, { ModalPosition } from "./AppModal";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { BubbleChatIcon } from "@/icons";



interface ChatWithPhysicianProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatWithPhysician: React.FC<ChatWithPhysicianProps> = ({
  isOpen,
  onClose,
}) => {
  useBodyScrollLock(isOpen);
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<BubbleChatIcon fill="#000" />}
      title="Chat with Your Physician"
      outSideClickClose={false}
      subtitle={'Follow up about your request'}
      position={ModalPosition.RIGHT}
      showFooter={false}
    >
        <div>
            <p className="text-base font-normal text-gray-800">chat with Physician</p>
        </div>
    </AppModal>
  );
};

export default ChatWithPhysician;
