"use client";
import React, { useEffect, useState } from "react";
import AppModal from "./AppModal";
import { AssignDoctorIcon, PlusIcon } from "@/icons";
import ThemeInput from "../inputs/ThemeInput";
import { ManagersType } from "../cards/ManagersDatabaseView";
import Dropdown from "../inputs/ThemeDropDown";

interface AssignDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialvalues?: ManagersType | null;
}

const AssignDoctorModal: React.FC<AssignDoctorModalProps> = ({
  isOpen,
  onClose,
  initialvalues,
}) => {
  const [ManagerName, setManagerName] = useState("");

  useEffect(() => {
    if (initialvalues) {
      setManagerName(initialvalues.name);
    } else {
      setManagerName("");
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
      title={"Assign Doctors"}
      onConfirm={handleConfirm}
      confirmLabel={"Assign"}
      icon={<AssignDoctorIcon />}
      size="small"
      outSideClickClose={true}
      onCancel={onClose}
      cancelLabel="Cancel"
      btnIcon={<PlusIcon />}
      confimBtnDisable={false}
    >
      <div className="flex flex-col gap-4">
        <ThemeInput
          label="Manager"
          value={ManagerName}
          onChange={() => {}}
          placeholder="Enter full name"
        />
        <Dropdown
          label="Assign Doctors"
          options={[
            { label: "Dr. John Doe", value: "john_doe" },
            { label: "Dr. Jane Smith", value: "jane_smith" },
            { label: "Dr. Emily Johnson", value: "emily_johnson" },
          ]}
          onChange={() => {}}
        />
      </div>
    </AppModal>
  );
};

export default AssignDoctorModal;
