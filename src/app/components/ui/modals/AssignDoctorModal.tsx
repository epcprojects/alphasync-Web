"use client";

import React, { useEffect, useMemo, useState } from "react";
import AppModal from "./AppModal";
import { AssignDoctorIcon, PlusIcon } from "@/icons";
import ThemeInput from "../inputs/ThemeInput";
import { ManagersType } from "../cards/ManagersDatabaseView";
import SelectGroupDropdown from "../dropdowns/selectgroupDropdown";
import { useQuery, useMutation } from "@apollo/client/react";
import { ALL_DOCTORS } from "@/lib/graphql/queries";
import { ASSIGN_DOCTORS_TO_MANAGER } from "@/lib/graphql/mutations";
import { UserAttributes } from "@/lib/graphql/attributes";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface AllDoctorsResponse {
  allDoctors: {
    allData: UserAttributes[];
  };
}

interface AssignDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialvalues?: ManagersType | null;
  onConfirm?: () => void;
}

const AssignDoctorModal: React.FC<AssignDoctorModalProps> = ({
  isOpen,
  onClose,
  initialvalues,
  onConfirm,
}) => {
  const [managerName, setManagerName] = useState("");
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");

  const { data: doctorsData, loading: doctorsLoading } =
    useQuery<AllDoctorsResponse>(ALL_DOCTORS, {
      variables: {
        status: "ACTIVE",
        perPage: doctorSearchTerm.trim() ? 50 : 30,
        page: 1,
        search: doctorSearchTerm.trim() || undefined,
      },
      skip: !isOpen,
      fetchPolicy: "network-only",
    });

  const [assignDoctorsToManager, { loading: assignLoading }] = useMutation(
    ASSIGN_DOCTORS_TO_MANAGER,
    {
      onCompleted: (data) => {
        const result = data?.assignDoctorsToManager;
        const msg = result?.message ?? "Doctors assigned successfully.";
        showSuccessToast(msg);
        onConfirm?.();
        onClose();
        setSelectedDoctorIds([]);
      },
      onError: (error) => {
        showErrorToast(error.message);
      },
    },
  );

  useEffect(() => {
    if (initialvalues) {
      setManagerName(initialvalues.name);
    } else {
      setManagerName("");
    }
  }, [initialvalues]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDoctorIds([]);
      setDoctorSearchTerm("");
    }
  }, [isOpen]);

  // Pre-select already assigned doctors when modal opens
  useEffect(() => {
    if (isOpen && initialvalues) {
      const ids = (initialvalues.assignedDoctorIds ?? []).map((id) =>
        String(id),
      );
      setSelectedDoctorIds(ids);
    }
  }, [isOpen, initialvalues?.id, initialvalues?.assignedDoctorIds]);

  const doctorGroups = useMemo(() => {
    const list = doctorsData?.allDoctors?.allData ?? [];
    return list.map((d) => ({
      name: String(d.id),
      displayName:
        d.fullName ??
        ([d.firstName, d.lastName].filter(Boolean).join(" ") || d.email) ??
        "Unknown",
      email: d.email,
    }));
  }, [doctorsData]);

  const handleConfirm = async () => {
    if (!initialvalues?.id) {
      showErrorToast("Manager is required.");
      return;
    }
    const managerId = String(initialvalues.id);
    try {
      await assignDoctorsToManager({
        variables: {
          managerId,
          doctorIds: selectedDoctorIds.length > 0 ? selectedDoctorIds : [],
        },
      });
    } catch {
      // Error handled in onError
    }
  };

  const loading = doctorsLoading || assignLoading;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Doctors"
      onConfirm={handleConfirm}
      confirmLabel={assignLoading ? "Assigning..." : "Assign"}
      icon={<AssignDoctorIcon />}
      size="small"
      outSideClickClose={true}
      onCancel={onClose}
      cancelLabel="Cancel"
      btnIcon={<PlusIcon />}
      confimBtnDisable={loading}
    >
      <div className="flex flex-col gap-4">
        <ThemeInput
          label="Manager"
          value={managerName}
          onChange={() => {}}
          placeholder="Manager name"
          disabled
        />
        <div className="z-[200] overflow-visible">
          <SelectGroupDropdown
            name="Assign Doctors"
            placeholder="Select doctors to assign..."
            selectedGroup={loading ? [] : selectedDoctorIds}
            setSelectedGroup={
              setSelectedDoctorIds as (g: string | string[]) => void
            }
            groups={doctorGroups}
            searchTerm={doctorSearchTerm}
            setSearchTerm={setDoctorSearchTerm}
            required={false}
            showLabel={true}
            multiple={true}
            alwaysShowSearch={true}
            clientSideSearch={false}
            isSearching={doctorsLoading}
            disableFlip={true}
            usePortal={true}
            disabled={loading}
            displaySelectedAsCount={true}
            displaySelectedCountLabel="doctors"
          />
        </div>
      </div>
    </AppModal>
  );
};;

export default AssignDoctorModal;
