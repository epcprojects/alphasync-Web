import React, { useState } from "react";
import AppModal from "./AppModal";
import { NoteIcon } from "@/icons";
import TextAreaField from "../inputs/TextAreaField";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { note: string }) => void | Promise<void>;
  itemTitle?: string;
  isSubmitting?: boolean;
  disableAutoClose?: boolean;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  disableAutoClose = false,
}) => {
  const [note, setNote] = useState("");

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setNote("");
  };

  const handleConfirm = async () => {
    if (!note.trim() || isSubmitting) return;

    try {
      await Promise.resolve(onConfirm({ note }));

      setNote("");

      if (!disableAutoClose) {
        onClose();
      }
    } catch {
      // Swallow error so the modal stays open and the note content persists
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Note"
      outSideClickClose={!isSubmitting}
      onConfirm={handleConfirm}
      confirmLabel="Save"
      icon={<NoteIcon />}
      confimBtnDisable={!note.trim() || isSubmitting}
      disableCloseButton={isSubmitting}
    >
      <TextAreaField
        label=""
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a new note..."
        disabled={isSubmitting}
      />
    </AppModal>
  );
};

export default AddNoteModal;
