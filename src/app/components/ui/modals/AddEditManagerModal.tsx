"use client";
import React, { useEffect, useState } from "react";
import AppModal from "./AppModal";
import { PlusIcon, PlusProfileIcon } from "@/icons";
import ThemeInput from "../inputs/ThemeInput";
import { ManagersType } from "../cards/ManagersDatabaseView";
import { useMutation } from "@apollo/client/react";
import { CREATE_INVITATION } from "@/lib/graphql/mutations";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import * as Yup from "yup";

interface AddEditManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialvalues?: ManagersType | null;
  onConfirm?: () => void;
}

const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;

function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 10);
  if (numbers.length === 0) return "";
  if (numbers.length <= 3) return `(${numbers}`;
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
}

const AddEditManagerModal: React.FC<AddEditManagerModalProps> = ({
  isOpen,
  onClose,
  initialvalues,
  onConfirm,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inviteSchema = Yup.object().shape({
    name: Yup.string().required("Full name is required").trim(),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(phoneRegex, "Phone must be (000) 000-0000"),
  });

  const [createInvitation, { loading }] = useMutation(CREATE_INVITATION, {
    onCompleted: () => {
      showSuccessToast("Manager invitation sent successfully");
      onConfirm?.();
      onClose();
      resetForm();
    },
    onError: (error) => {
      showErrorToast(error.message);
    },
  });

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setErrors({});
  };

  useEffect(() => {
    if (initialvalues) {
      setName(initialvalues.name);
      setEmail(initialvalues.email);
      setPhone(initialvalues.contact || "");
    } else if (isOpen) {
      resetForm();
    }
  }, [initialvalues, isOpen]);

  const handleConfirm = async () => {
    const payload = { name: name.trim(), email: email.trim(), phone };
    try {
      await inviteSchema.validate(payload, { abortEarly: false });
      setErrors({});
    } catch (err: unknown) {
      const next: Record<string, string> = {};
      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((e) => {
          if (e.path) next[e.path] = e.message;
        });
      }
      setErrors(next);
      return;
    }

    if (initialvalues) {
      // Edit: not using CreateInvitation; could wire UPDATE_USER here later
      return;
    }

    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ") || firstName;

    try {
      await createInvitation({
        variables: {
          email: payload.email,
          firstName,
          lastName,
          phoneNo: payload.phone,
          userType: "MANAGER",
        },
      });
    } catch {
      // Error already handled in onError
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhoneNumber(value));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const isAdd = !initialvalues;
  const isValid = isAdd
    ? !!(name.trim() && email.trim() && phoneRegex.test(phone))
    : true;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialvalues ? "Edit Manager" : "Add Manager"}
      onConfirm={handleConfirm}
      confirmLabel={
        initialvalues ? "Update" : loading ? "Sending..." : "Add Manager"
      }
      icon={<PlusProfileIcon />}
      size="small"
      outSideClickClose={true}
      onCancel={onClose}
      cancelLabel="Cancel"
      btnIcon={<PlusIcon />}
      confimBtnDisable={!isValid || loading}
    >
      <div className="flex flex-col gap-4">
        <ThemeInput
          label="Full Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          placeholder="Enter full name"
          required={true}
          error={!!errors.name}
          errorMessage={errors.name}
        />
        <ThemeInput
          label="Email Address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          }}
          placeholder="Enter email address"
          required={true}
          error={!!errors.email}
          errorMessage={errors.email}
        />
        <ThemeInput
          label="Phone Number"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="(316) 555-0116"
          required={true}
          error={!!errors.phone}
          errorMessage={errors.phone}
        />
      </div>
    </AppModal>
  );
};

export default AddEditManagerModal;
