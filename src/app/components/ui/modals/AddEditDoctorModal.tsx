/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import AppModal from "./AppModal";
import { DoctorIcon } from "@/icons";
import AvatarUploader from "../../AvatarUploader";
import ThemeInput from "../inputs/ThemeInput";
import SelectGroupDropdown from "../dropdowns/selectgroupDropdown";
import * as Yup from "yup";
import { Doctor } from "../cards/DoctorListView";

interface AddEditDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Doctor) => void;
  initialData?: Doctor; // for editing
}

const AddEditDoctorModal: React.FC<AddEditDoctorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialData,
}) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    phone: "",
    email: "",
    medicalLicenseNumber: "",
    specialty: "",
    status: "Active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const schema = Yup.object().shape({
    name: Yup.string().required("Doctor name is required"),
    phone: Yup.string().required("Phone number is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    medicalLicense: Yup.string().required("Medical License is required"),
    specialty: Yup.string().required("Specialty is required"),
    status: Yup.string().oneOf(["Active", "Inactive"]).required(),
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupSelect = (user: string | string[]) => {
    const userSelected = Array.isArray(user) ? user[0] : user;
    setSelectedUser(userSelected);
    setFormData((prev) => ({ ...prev, specialty: userSelected }));
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
      onConfirm(formData);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
        setSelectedUser(initialData.specialty || "");
      } else {
        setFormData({
          id: 1,
          name: "",
          phone: "",
          email: "",
          medicalLicenseNumber: "",
          specialty: "",
          status: "Active",
        });
        setSelectedUser("");
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Doctor" : "Add New Doctor"}
      onConfirm={handleConfirm}
      confirmLabel={"Save"}
      icon={<DoctorIcon />}
      size="large"
      outSideClickClose={false}
      onCancel={handleCancel}
      cancelLabel={"Cancel"}
    >
      <div className="flex flex-col gap-2 md:gap-5">
        <AvatarUploader
          showTitle
          roundedClass="rounded-lg"
          width={96}
          height={96}
        />

        <div className="flex items-start gap-2 md:gap-5">
          <div className="w-full">
            <ThemeInput
              required
              label="Name"
              placeholder="Enter doctor name"
              name="name"
              error={!!errors.name}
              errorMessage={errors.name}
              id="name"
              onChange={(e) => handleChange("name", e.target.value)}
              type="text"
              value={formData.name}
            />
          </div>

          <div className="w-full">
            <ThemeInput
              required
              label="Phone"
              placeholder="Enter phone number"
              name="phone"
              error={!!errors.phone}
              errorMessage={errors.phone}
              id="phone"
              onChange={(e) => handleChange("phone", e.target.value)}
              type="text"
              value={formData.phone}
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
              value={formData.medicalLicenseNumber}
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
              name="specialty"
              multiple={false}
              placeholder="Select specialty"
              searchTerm={""}
              setSearchTerm={() => {}}
              isShowDrop={true}
              required
              paddingClasses="py-2.5 px-2"
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
