/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import AppModal from "./AppModal";
import { Calendar, UserAddIcon } from "@/icons";
import ThemeInput from "../inputs/ThemeInput";
import Stepper from "../../Stepper";
import TextAreaField from "../inputs/TextAreaField";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: null as Date | null,
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

  const handleChange = (field: string, value: string | Date | null) => {
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
      dateOfBirth: new Date(),
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
            <div className="w-full">
              <label className="block mb-1 text-sm text-gray-700 font-medium text-start">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <DatePicker
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                wrapperClassName="w-full"
                placeholderText="mm/dd/yyyy"
                toggleCalendarOnIconClick
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  handleChange("dateOfBirth", date);
                }}
                className={`border ${
                  errors.dateOfBirth ? "border-red-500" : "border-lightGray"
                } rounded-lg flex px-2 md:px-3 outline-none focus:ring focus:ring-gray-100 
       placeholder:text-gray-600 text-gray-800 items-center !py-3 h-11 !w-full`}
                maxDate={new Date()}
                minDate={new Date(1900, 0, 1)}
                showIcon
                icon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.3335 7.99984C1.3335 5.48568 1.3335 4.2286 2.11454 3.44755C2.89559 2.6665 4.15267 2.6665 6.66683 2.6665H9.3335C11.8477 2.6665 13.1047 2.6665 13.8858 3.44755C14.6668 4.2286 14.6668 5.48568 14.6668 7.99984V9.33317C14.6668 11.8473 14.6668 13.1044 13.8858 13.8855C13.1047 14.6665 11.8477 14.6665 9.3335 14.6665H6.66683C4.15267 14.6665 2.89559 14.6665 2.11454 13.8855C1.3335 13.1044 1.3335 11.8473 1.3335 9.33317V7.99984Z"
                      stroke="#6B7280"
                    />
                    <path
                      d="M4.6665 2.6665V1.6665"
                      stroke="#6B7280"
                      stroke-linecap="round"
                    />
                    <path
                      d="M11.3335 2.6665V1.6665"
                      stroke="#6B7280"
                      stroke-linecap="round"
                    />
                    <path
                      d="M1.6665 6H14.3332"
                      stroke="#6B7280"
                      stroke-linecap="round"
                    />
                  </svg>
                }
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
