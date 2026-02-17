"use client";
import React, { useEffect, useState } from "react";
import AppModal from "./AppModal";
import { AssignDoctorIcon, CrossIcon, PlusIcon } from "@/icons";
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

  const [doctors, setDoctors] = useState<string[]>([]);

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
      scrollNeeded={false}
    >
      <div className="flex flex-col gap-4">
        <ThemeInput
          label="Manager"
          value={ManagerName}
          onChange={() => {}}
          placeholder="Enter full name"
        />

        <Dropdown
          showSearch
          searchPlaceholder="Search..."
          multiple
          label="Assign Doctors"
          options={[
            {
              label: "Dr. John Doe",
              value: "john_doe",
              email: "john.smith@email.com",
            },
            {
              label: "Dr. Jane Smith",
              value: "jane_smith",
              email: "sarah.j@email.com",
            },
            {
              label: "Dr. Emily Johnson",
              value: "emily_johnson",
              email: "emily.chen@email.com",
            },
          ]}
          value={doctors}
          onChange={(v) => setDoctors(v as string[])}
          placeholder="Select Doctor"
        />

        <div className="flex items-center gap-2">
          {doctors.map((doc) => (
            <h2
              className="py-0.5 flex items-center gap-1 border border-gray-200 bg-gray-50 w-fit rounded-4xl text-xs  pe-1.5 ps-3"
              key={doc}
            >
              {doc} <CrossIcon height="12" width="12" />
            </h2>
          ))}
        </div>
      </div>
    </AppModal>
  );
};

export default AssignDoctorModal;
