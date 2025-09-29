/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import AppModal from "./AppModal";
import { UserAddIcon } from "@/icons";
import ThemeInput from "../inputs/ThemeInput";
import Stepper from "../../Stepper";
import TextAreaField from "../inputs/TextAreaField";
import * as Yup from "yup";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
    medicalHistory: "",
    allergies: "",
    medications: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const schemas = [
    Yup.object({
      fullName: Yup.string().required("Full name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phone: Yup.string().required("Phone number is required"),
      dateOfBirth: Yup.string().required("Date of Birth is required"),
      address: Yup.string().required("Address is required"),
    }),
    Yup.object({
      emergencyName: Yup.string().required(
        "Emergency contact name is required"
      ),
      emergencyPhone: Yup.string().required(
        "Emergency contact phone is required"
      ),
      medicalHistory: Yup.string().optional(),
      allergies: Yup.string().optional(),
      medications: Yup.string().optional(),
    }),
    Yup.object({
      notes: Yup.string().optional(),
    }),
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = async () => {
    try {
      await schemas[step - 1].validate(formData, { abortEarly: false });
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

  const handleCancel = () => {
    if (step === 1) {
      onClose();
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleConfirm = async () => {
    if (step < 3) {
      const valid = await validateStep();
      if (valid) setStep((s) => s + 1);
    } else {
      const valid = await validateStep();
      if (valid) {
        onConfirm(formData);
        onClose();
      }
    }
  };

  const steps = [
    { id: 1, label: "Personal Information" },
    { id: 2, label: "Emergency Contact & Medical Info" },
    { id: 3, label: "Additional Notes" },
  ];

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      emergencyName: "",
      emergencyPhone: "",
      medicalHistory: "",
      allergies: "",
      medications: "",
      notes: "",
    });
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setErrors({});
      setStep(1);
    }
  }, [isOpen]);

  const isStepValid = () => {
    try {
      schemas[step - 1].validateSync(formData, { abortEarly: false });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer"
      onConfirm={handleConfirm}
      confirmLabel={step === 3 ? "Create Customer" : "Next"}
      icon={<UserAddIcon fill="#374151" />}
      size="large"
      outSideClickClose={false}
      onCancel={handleCancel}
      cancelLabel={step === 1 ? "Cancel" : "Back"}
      confimBtnDisable={!isStepValid()}
    >
      <div className="flex flex-col gap-8">
        <Stepper activeStep={step} steps={steps} />

        {step === 1 && (
          <div className="flex flex-col gap-2 md:gap-5">
            <ThemeInput
              required
              label="Full Name"
              placeholder="Enter full name"
              name="fullName"
              error={!!errors.fullName}
              errorMessage={errors.fullName}
              id="fullName"
              onChange={(e) => handleChange("fullName", e.target.value)}
              type="text"
              value={formData.fullName}
            />
            <div className="flex items-center gap-3 md:gap-5 w-full">
              <div className="w-full">
                <ThemeInput
                  required
                  label="Email Address"
                  placeholder="Enter email address"
                  name="email"
                  error={!!errors.email}
                  errorMessage={errors.email}
                  id="email"
                  onChange={(e) => handleChange("email", e.target.value)}
                  type="email"
                  value={formData.email}
                  className="w-full"
                />
              </div>
              <div className="w-full">
                <ThemeInput
                  required
                  label="Phone Number"
                  placeholder="(316) 555-0116"
                  name="phone"
                  error={!!errors.phone}
                  errorMessage={errors.phone}
                  id="phone"
                  onChange={(e) => handleChange("phone", e.target.value)}
                  type="number"
                  value={formData.phone}
                  className="w-full [&::-webkit-outer-spin-button]:appearance-none [moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-700 font-medium text-start">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className={`${
                  errors.dateOfBirth ? "border-red-500" : "border-lightGray"
                } w-full focus:ring h-11 p-2 md:px-3 md:py-2.5 border rounded-lg outline-none text-gray-900 placeholder:text-neutral-300  focus:ring-gray-200`}
                type="date"
                min="1900-01-01"
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>
            <ThemeInput
              required
              label="Address"
              placeholder="Enter complete address"
              name="address"
              error={!!errors.address}
              errorMessage={errors.address}
              id="address"
              onChange={(e) => handleChange("address", e.target.value)}
              type="text"
              value={formData.address}
            />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-2 md:gap-5">
            <div className="flex items-center gap-2 w-full">
              <div className="w-full">
                <ThemeInput
                  required
                  label="Emergency Contact Name"
                  placeholder="Enter emergency contact name"
                  name="emergencyName"
                  error={!!errors.emergencyName}
                  errorMessage={errors.emergencyName}
                  id="emergencyName"
                  onChange={(e) =>
                    handleChange("emergencyName", e.target.value)
                  }
                  type="text"
                  value={formData.emergencyName}
                  className="w-full"
                />
              </div>
              <div className="w-full">
                <ThemeInput
                  required
                  label="Emergency Contact Phone"
                  placeholder="(316) 555-0116"
                  name="emergencyPhone"
                  error={!!errors.emergencyPhone}
                  errorMessage={errors.emergencyPhone}
                  id="emergencyPhone"
                  onChange={(e) =>
                    handleChange("emergencyPhone", e.target.value)
                  }
                  type="number"
                  value={formData.emergencyPhone}
                  className="w-full [&::-webkit-outer-spin-button]:appearance-none [moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <TextAreaField
              label="Medical History"
              value={formData.medicalHistory}
              onChange={(e) => handleChange("medicalHistory", e.target.value)}
              placeholder="Enter relevant medical history"
              // required
            />
            {/* {errors.medicalHistory && (
            <p className="text-xs text-red-500 mt-1">{errors.medicalHistory}</p>
          )} */}
            <TextAreaField
              label="Known Allergies"
              value={formData.allergies}
              onChange={(e) => handleChange("allergies", e.target.value)}
              placeholder="List any known allergies"
              // required
            />
            {/* {errors.allergies && (
            <p className="text-xs text-red-500 mt-1">{errors.allergies}</p>
          )} */}
            <TextAreaField
              label="Current Medications"
              value={formData.medications}
              onChange={(e) => handleChange("medications", e.target.value)}
              placeholder="List current medications and dosages"
              // required
            />
            {/* {errors.medications && (
            <p className="text-xs text-red-500 mt-1">{errors.medications}</p>
          )} */}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-2 md:gap-4">
            <TextAreaField
              label="Additional Notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Enter any additional notes about the customer"
              // required
            />
            {/* {errors.notes && (
            <p className="text-xs text-red-500 mt-1">{errors.notes}</p>
          )} */}
          </div>
        )}
      </div>
    </AppModal>
  );
};

export default AddCustomerModal;
