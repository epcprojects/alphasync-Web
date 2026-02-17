/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import AppModal, { ModalPosition } from "./AppModal";
import { DoctorIcon } from "@/icons";
import ThemeInput from "../inputs/ThemeInput";
import { UserAttributes } from "@/lib/graphql/attributes";
import MedicalLicensesSection from "../../medicalLicensesComponent";

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: UserAttributes) => void;
  initialData?: UserAttributes;
}

const AddDoctorModal: React.FC<AddDoctorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async () => {
    console.log("confirm api");
  };

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit mode
        // Split fullName into firstName and lastName if available
        const nameParts = (initialData.fullName || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        setFormData({
          firstName: initialData.firstName || firstName,
          lastName: initialData.lastName || lastName,

          email: initialData.email || "",
        });
      } else {
        // Add mode
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const { firstName, lastName, email } = formData;

    // Check which fields are empty
    const emptyFields = [];
    if (!firstName) emptyFields.push("firstName");
    if (!lastName) emptyFields.push("lastName");
    if (!email) emptyFields.push("email");

    if (emptyFields.length > 0) {
      console.log("⚠️ Form invalid - Empty fields:", emptyFields);
      console.log("📋 Current form data:", formData);
      setIsFormValid(false);
    } else {
      console.log("✅ Form is valid - All fields filled");
      setIsFormValid(true);
    }
  }, [formData]);
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={"Add New Doctor"}
      onConfirm={handleConfirm}
      confirmLabel={"Add New"}
      icon={<DoctorIcon />}
      size="medium"
      outSideClickClose={false}
      confimBtnDisable={!isFormValid}
      onCancel={handleCancel}
      cancelLabel={"Cancel"}
    >
      <div className="flex flex-col gap-3 md:gap-5">
        <div className="flex flex-col  items-start gap-3 md:gap-5">
          <div className="w-full">
            <ThemeInput
              required
              label="First Name"
              placeholder="Enter first name"
              name="firstName"
              error={!!errors.firstName}
              errorMessage={errors.firstName}
              id="firstName"
              onChange={(e) => handleChange("firstName", e.target.value)}
              type="text"
              value={formData.firstName}
            />
          </div>

          <div className="w-full">
            <ThemeInput
              required
              label="Last Name"
              placeholder="Enter last name"
              name="lastName"
              error={!!errors.lastName}
              errorMessage={errors.lastName}
              id="lastName"
              onChange={(e) => handleChange("lastName", e.target.value)}
              type="text"
              value={formData.lastName}
            />
          </div>
        </div>

        <ThemeInput
          required
          label="Email"
          placeholder="Enter email address"
          name="email"
          error={!!errors.email}
          errorMessage={errors.email}
          id="email"
          onChange={(e) => handleChange("email", e.target.value)}
          type="email"
          value={formData.email}
        />
      </div>
    </AppModal>
  );
};

export default AddDoctorModal;
