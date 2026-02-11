"use client";
import React, { useEffect, useState } from "react";
import AppModal from "./AppModal";
import { PlusIcon, PlusProfileIcon } from "@/icons";
import ThemeInput from "../inputs/ThemeInput";
import { OganizationUser } from "../cards/OrganizationDatabaseView";

interface AddEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialvalues?: OganizationUser | null;
}

const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  isOpen,
  onClose,
  initialvalues,
}) => {
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [Phone, setPhone] = useState("");

  useEffect(() => {
    if (initialvalues) {
      setName(initialvalues.name);
      setEmail(initialvalues.email);
      setPhone(initialvalues.contact);
    } else {
      setName("");
      setEmail("");
      setPhone("");
    }
  }, [initialvalues]);
  const handleConfirm = async () => {
    console.log("confirmed");
  };

  console.log(initialvalues, "init");

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialvalues ? "Edit Organization User" : "Add Organization User"}
      onConfirm={handleConfirm}
      confirmLabel={initialvalues ? "Update" : "Add User"}
      icon={<PlusProfileIcon />}
      size="small"
      outSideClickClose={true}
      onCancel={onClose}
      cancelLabel="Cancel"
      btnIcon={<PlusIcon />}
      confimBtnDisable={false}
    >
      <div className="flex flex-col gap-4">
        <ThemeInput
          label="Full Name"
          value={Name}
          onChange={() => {}}
          placeholder="Enter full name"
          required={true}
        />
        <ThemeInput
          label="Email Address"
          value={Email}
          onChange={() => {}}
          placeholder="Enter email address"
          required={true}
        />
        <ThemeInput
          label="Phone Number"
          value={Phone}
          onChange={() => {}}
          placeholder="(316) 555-0116"
          required={true}
        />
      </div>
    </AppModal>
  );
};

export default AddEditUserModal;
