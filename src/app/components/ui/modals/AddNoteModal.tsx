import React, { useState } from "react";
import AppModal from "./AppModal";
import { NoteIcon } from "@/icons";
import TextAreaField from "../inputs/TextAreaField";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { note: string }) => void;
  itemTitle?: string;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [note, setNote] = useState("");

  const handleClose = () => {
    onClose();
    setNote("");
  };

  const handleConfirm = () => {
    if (note.trim()) {
      onConfirm({ note });
      setNote("");
      onClose();
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Note"
      outSideClickClose={false}
      onConfirm={handleConfirm}
      confirmLabel="Save"
      icon={<NoteIcon />}
      confimBtnDisable={!note.trim()}
    >
      <TextAreaField
        label=""
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a new note..."
      />
    </AppModal>
  );
};

export default AddNoteModal;
