/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import AppModal from "./AppModal";
import { AdminIcon } from "@/icons";
import ThemeInput from "../inputs/ThemeInput";
import * as Yup from "yup";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useMutation } from "@apollo/client/react";
import { CREATE_INVITATION } from "@/lib/graphql/mutations";

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const schema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    phoneNo: Yup.string()
      .required("Phone number is required")
      .matches(
        /^\(\d{3}\)\s\d{3}-\d{4}$/,
        "Phone number must be in format (512) 312-3123"
      ),
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const [createInvitation, { loading }] = useMutation(CREATE_INVITATION, {
    onCompleted: () => {
      showSuccessToast("Admin invitation sent successfully");
      onConfirm();
      onClose();
      resetForm();
    },
    onError: (error) => {
      showErrorToast(error.message);
    },
  });

  // Format phone number to (XXX) XXX-XXXX format
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, "");

    // Limit to 10 digits
    const limitedNumbers = numbers.slice(0, 10);

    // Format based on length
    if (limitedNumbers.length === 0) return "";
    if (limitedNumbers.length <= 3) return `(${limitedNumbers}`;
    if (limitedNumbers.length <= 6) {
      return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3)}`;
    }
    return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(
      3,
      6
    )}-${limitedNumbers.slice(6)}`;
  };

  const handleChange = (field: string, value: string) => {
    if (field === "phoneNo") {
      value = formatPhoneNumber(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      err.inner.forEach((error: any) => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleConfirm = async () => {
    const valid = await validateForm();

    if (valid) {
      try {
        await createInvitation({
          variables: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNo: formData.phoneNo,
            userType: "ADMIN",
          },
        });
      } catch (error) {
        console.error("Error creating admin invitation:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phoneNo: "",
      email: "",
    });
    setErrors({});
    setIsFormValid(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    const { firstName, lastName, phoneNo, email } = formData;
    if (firstName && lastName && phoneNo && email) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [formData]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Admin"
      onConfirm={handleConfirm}
      confirmLabel="Create Admin"
      icon={<AdminIcon fill="#374151" />}
      size="medium"
      outSideClickClose={false}
      confimBtnDisable={!isFormValid || loading}
      onCancel={handleCancel}
      cancelLabel={"Cancel"}
    >
      <div className="flex flex-col gap-2 md:gap-5">
        <div className="flex items-start flex-col sm:flex-row gap-2 md:gap-5">
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

        <ThemeInput
          required
          label="Phone Number"
          placeholder="(316) 555-0116"
          name="phoneNo"
          error={!!errors.phoneNo}
          errorMessage={errors.phoneNo}
          id="phoneNo"
          onChange={(e) => handleChange("phoneNo", e.target.value)}
          type="tel"
          value={formData.phoneNo}
          className="w-full [&::-webkit-outer-spin-button]:appearance-none [moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </AppModal>
  );
};

export default AddAdminModal;
