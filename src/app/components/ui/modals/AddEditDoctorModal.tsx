/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import AppModal from "./AppModal";
import { DoctorIcon } from "@/icons";
import { ImageUpload } from "@/app/components";
import ThemeInput from "../inputs/ThemeInput";
import SelectGroupDropdown from "../dropdowns/selectgroupDropdown";
import * as Yup from "yup";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useMutation } from "@apollo/client/react";
import { CREATE_INVITATION, UPDATE_USER } from "@/lib/graphql/mutations";
import { UserAttributes } from "@/lib/graphql/attributes";

interface AddEditDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: UserAttributes) => void;
  initialData?: UserAttributes;
}

const AddEditDoctorModal: React.FC<AddEditDoctorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialData,
}) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNo: "",
    email: "",
    medicalLicense: "",
    specialty: "",
    status: "Active",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const schema = Yup.object().shape({
    fullName: Yup.string().required("Doctor fullName is required"),
    phoneNo: Yup.string()
      .required("Phone number is required")
      .matches(
        /^\(\d{3}\)\s\d{3}-\d{4}$/,
        "Phone number must be in format (512) 312-3123"
      ),
    email: Yup.string().email("Invalid email").required("Email is required"),
    medicalLicense: Yup.string().required("Medical License is required"),
    specialty: Yup.string().required("Specialty is required"),
    status: Yup.string().oneOf(["Active", "Inactive"]).required(),
  });

  const [createInvitation, { loading: createLoading }] = useMutation(
    CREATE_INVITATION,
    {
      onCompleted: (data) => {
        showSuccessToast("Doctor Added Successfully");
        onConfirm(data.createInvitation);
        onClose();
      },
      onError: (error) => {
        showErrorToast(error.message);
      },
    }
  );

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER, {
    onCompleted: (data) => {
      showSuccessToast("Doctor Updated Successfully");
      onConfirm(data.updateUser.user);
      onClose();
    },
    onError: (error) => {
      showErrorToast(error.message);
    },
  });

  const loading = createLoading || updateLoading;
  console.log(formData);

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
    // Auto-format phone numbers
    if (field === "phoneNo" && typeof value === "string") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleGroupSelect = (user: string | string[]) => {
    const userSelected = Array.isArray(user) ? user[0] : user;
    setSelectedUser(userSelected);
    setFormData((prev) => ({ ...prev, specialty: userSelected }));
  };

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
  };

  const validateForm = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      err.inner.forEach((e: any) => {
        if (e.path) newErrors[e.path] = e.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleConfirm = async () => {
    const valid = await validateForm();

    if (valid) {
      try {
        const variables = {
          ...formData,
          status: formData.status.toUpperCase(),
          image: selectedImage,
        };

        if (initialData) {
          // Edit mode - use UPDATE_USER mutation (no userType needed)
          await updateUser({
            variables: {
              id: initialData.id, // Include the user ID for update
              ...variables,
            },
          });
        } else {
          // Create mode - use CREATE_INVITATION mutation with userType
          await createInvitation({
            variables: {
              ...variables,
              userType: "DOCTOR",
            },
          });
        }
      } catch (error) {
        // Error handling is done in the mutation onError callbacks
        console.error("Error:", error);
      }
    }
  };

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit mode
        setFormData({
          fullName: initialData.fullName || "",
          phoneNo: initialData.phoneNo || "",
          email: initialData.email || "",
          medicalLicense: initialData.medicalLicense || "",
          specialty: initialData.specialty || "",
          status:
            initialData.status === "ACTIVE"
              ? "Active"
              : initialData.status === "INACTIVE"
              ? "Inactive"
              : "Active",
        });
        setSelectedUser(initialData.specialty || "");
      } else {
        // Add mode
        setFormData({
          fullName: "",
          phoneNo: "",
          email: "",
          medicalLicense: "",
          specialty: "",
          status: "Active",
        });
        setSelectedUser("");
      }
      setSelectedImage(null);
      setErrors({});
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const { fullName, phoneNo, email, medicalLicense, specialty, status } =
      formData;
    if (fullName && phoneNo && email && medicalLicense && specialty && status) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [formData]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Doctor" : "Add New Doctor"}
      onConfirm={handleConfirm}
      confirmLabel={initialData ? "Save" : "Add New"}
      icon={<DoctorIcon />}
      size="large"
      outSideClickClose={false}
      confimBtnDisable={!isFormValid || loading}
      onCancel={handleCancel}
      cancelLabel={"Cancel"}
    >
      <div className="flex flex-col gap-2 md:gap-5">
        <ImageUpload
          imageUrl={
            initialData?.imageUrl
              ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${initialData.imageUrl}`
              : undefined
          }
          onChange={handleImageChange}
          placeholder="/images/arinaProfile.png"
          showTitle={false}
          roundedClass="rounded-lg"
          width={96}
          height={96}
          className="border-b-0"
        />

        <div className="flex items-start gap-2 md:gap-5">
          <div className="w-full">
            <ThemeInput
              required
              label="Name"
              placeholder="Enter doctor name"
              name="fullName"
              error={!!errors.fullName}
              errorMessage={errors.fullName}
              id="fullName"
              onChange={(e) => handleChange("fullName", e.target.value)}
              type="text"
              value={formData.fullName}
            />
          </div>

          <div className="w-full">
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

        <div className="flex items-start gap-2 md:gap-5">
          <div className="w-full">
            <ThemeInput
              required
              label="Medical License"
              placeholder="Enter license number"
              name="medicalLicense"
              error={!!errors.medicalLicense}
              errorMessage={errors.medicalLicense}
              id="medicalLicense"
              onChange={(e) => handleChange("medicalLicense", e.target.value)}
              type="text"
              value={formData.medicalLicense}
            />
          </div>

          <div className="w-full">
            <SelectGroupDropdown
              selectedGroup={selectedUser}
              setSelectedGroup={handleGroupSelect}
              groups={[
                { name: "Cardiology", displayName: "Cardiology" },
                { name: "Orthopedics", displayName: "Orthopedics" },
                { name: "Dermatology", displayName: "Dermatology" },
              ]}
              name="Specialty"
              multiple={false}
              placeholder="Select specialty"
              searchTerm={""}
              setSearchTerm={() => {}}
              isShowDrop={true}
              required
              paddingClasses="py-2.5 px-3"
              optionPaddingClasses="p-1"
              showLabel={true}
            />
            {errors.specialty && (
              <p className="text-red-500 text-xs mt-1">{errors.specialty}</p>
            )}
          </div>
        </div>

        <div>
          <label
            className="mb-1.5 font-medium text-gray-700 text-xs md:text-sm block"
            htmlFor=""
          >
            Status
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="Active"
                name="status"
                checked={formData.status === "Active"}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
              />
              Active
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="Inactive"
                name="status"
                checked={formData.status === "Inactive"}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
              />
              Inactive
            </label>
          </div>
          {errors.status && (
            <p className="text-xs text-red-500 mt-1">{errors.status}</p>
          )}
        </div>
      </div>
    </AppModal>
  );
};

export default AddEditDoctorModal;
