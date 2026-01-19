/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import AppModal from "./AppModal";
import { UserAddIcon } from "@/icons";
import ThemeInput from "../inputs/ThemeInput";
import GoogleAutocompleteInput from "../inputs/GoogleAutocompleteInput";
import Stepper from "../../Stepper";
import TextAreaField from "../inputs/TextAreaField";
import * as Yup from "yup";
import { useMutation } from "@apollo/client";
import { CREATE_CUSTOMER } from "@/lib/graphql/mutations";
import { showErrorToast } from "@/lib/toast";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
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
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    dateOfBirth: "",
    address: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    postalCode: "",

    emergencyName: "",
    emergencyPhone: "",
    medicalHistory: "",
    allergies: "",
    medications: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [createInvitation, { loading, error }] = useMutation(CREATE_CUSTOMER, {
    onCompleted: (data) => {
      onConfirm({ id: data.createInvitation.id, ...formData });
      onClose();
    },
    onError: (error) => {
      console.error("Error creating customer:", error);
      showErrorToast("Failed to create customer. Please try again.");
    },
  });

  const schemas = [
    Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phoneNo: Yup.string()
        .required("Phone number is required")
        .matches(
          /^\(\d{3}\)\s\d{3}-\d{4}$/,
          "Please enter a valid phone number in format (316) 555-0116"
        ),
      dateOfBirth: Yup.string()
        .required("Date of Birth is required")
        .matches(
          /^\d{2}-\d{2}-\d{4}$/,
          "Date must be in format MM-DD-YYYY (e.g., 01-15-1990)"
        )
        .test("valid-date", "Please enter a valid date", (value) => {
          if (!value) return false;
          const date = parseDate(value);
          return date !== null;
        })
        .test(
          "not-future",
          "Date of Birth cannot be in the future",
          (value) => {
            if (!value) return false;
            const date = parseDate(value);
            if (!date) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            return date <= today;
          }
        ),
      address: Yup.string().optional(),
      street1: Yup.string().required("Street address is required"),
      street2: Yup.string().optional(),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      postalCode: Yup.string().required("Postal code is required"),
    }),
    Yup.object({
      medicalHistory: Yup.string().optional(),
      allergies: Yup.string().optional(),
      medications: Yup.string().optional(),
    }),
    Yup.object({
      notes: Yup.string().optional(),
    }),
  ];

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

  // Format date to MM-DD-YYYY format
  const formatDate = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, "");

    // Limit to 8 digits (MMDDYYYY)
    const limitedNumbers = numbers.slice(0, 8);

    // Format based on length
    if (limitedNumbers.length === 0) return "";
    if (limitedNumbers.length <= 2) return limitedNumbers;
    if (limitedNumbers.length <= 4) {
      return `${limitedNumbers.slice(0, 2)}-${limitedNumbers.slice(2)}`;
    }
    return `${limitedNumbers.slice(0, 2)}-${limitedNumbers.slice(
      2,
      4
    )}-${limitedNumbers.slice(4)}`;
  };

  // Parse MM-DD-YYYY format to Date object (browser-safe)
  const parseDate = (value: string): Date | null => {
    if (!value) return null;
    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) return null;

    const month = parseInt(match[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Validate month and day ranges
    if (month < 0 || month > 11) return null;
    if (day < 1 || day > 31) return null;

    const date = new Date(year, month, day);

    // Verify the date is valid (handles invalid dates like Feb 30)
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };

  const handleChange = (field: string, value: string | Date | null) => {
    // Auto-format phone numbers
    if (
      (field === "phoneNo" || field === "emergencyPhone") &&
      typeof value === "string"
    ) {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    } else if (field === "dateOfBirth" && typeof value === "string") {
      // Auto-format date to MM-DD-YYYY
      const formatted = formatDate(value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    // Mark field as touched when user interacts with it
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const validateStep = async () => {
    try {
      await schemas[step - 1].validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      const fieldsToTouch = new Set<string>();
      err.inner.forEach((e: any) => {
        if (e.path) {
          newErrors[e.path] = e.message;
          fieldsToTouch.add(e.path);
        }
      });
      // Mark all fields with errors as touched first, then set errors
      // This ensures errors are displayed immediately
      setTouchedFields((prev) => {
        const updated = new Set(prev);
        fieldsToTouch.forEach((field) => updated.add(field));
        return updated;
      });
      // Set errors immediately - this will trigger a re-render and show errors
      setErrors((prevErrors) => {
        // Merge with existing errors to ensure all validation errors are shown
        return { ...prevErrors, ...newErrors };
      });
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
        try {
          await createInvitation({
            variables: {
              fullName: `${formData.firstName} ${formData.lastName}`.trim(),
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phoneNo: formData.phoneNo,
              dateOfBirth: formData.dateOfBirth
                ? (() => {
                    const parsedDate = parseDate(formData.dateOfBirth);
                    return parsedDate ? parsedDate.toISOString() : null;
                  })()
                : null,
              address: formData.address || null,
              street1: formData.street1 || null,
              street2: formData.street2 || null,
              city: formData.city || null,
              state: formData.state || null,
              postalCode: formData.postalCode || null,

              emergencyContactName: formData.emergencyName,
              emergencyContactPhone: formData.emergencyPhone,
              medicalHistory: formData.medicalHistory || null,
              knownAllergies: formData.allergies || null,
              currentMedications: formData.medications || null,
              additionalNotes: formData.notes || null,
              userType: "PATIENT",
            },
          });
        } catch (err) {
          console.error("Error creating customer:", err);
        }
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
      firstName: "",
      lastName: "",
      email: "",
      phoneNo: "",
      dateOfBirth: "",
      address: "",
      street1: "",
      street2: "",
      city: "",
      state: "",
      postalCode: "",
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
      setTouchedFields(new Set());
      setStep(1);
    }
  }, [isOpen]);

  // Clear errors when step changes (user navigates back)
  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [step, isOpen]);

  // Validate and show errors on form data changes (only for touched fields)
  useEffect(() => {
    if (!isOpen) return;

    try {
      schemas[step - 1].validateSync(formData, { abortEarly: false });
      // Clear all errors for the current step when validation passes
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        // Get all field names for the current step schema
        const stepFields = Object.keys(schemas[step - 1].fields || {});
        // Clear errors for all fields in the current step
        stepFields.forEach((field) => {
          delete updatedErrors[field];
        });
        return updatedErrors;
      });
    } catch (err: any) {
      // Set errors when validation fails, but only for touched fields
      const newErrors: Record<string, string> = {};
      const fieldsWithErrors = new Set<string>();

      if (err.inner) {
        err.inner.forEach((e: any) => {
          // Show error if field has been touched
          if (e.path && touchedFields.has(e.path)) {
            newErrors[e.path] = e.message;
            fieldsWithErrors.add(e.path);
          }
        });
      }

      // Update errors: add new errors, remove errors for fields that are now valid
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };

        // Get all field names for the current step schema
        const stepFields = Object.keys(schemas[step - 1].fields || {});

        // Remove errors for fields that are touched but no longer have errors
        stepFields.forEach((field) => {
          if (touchedFields.has(field) && !fieldsWithErrors.has(field)) {
            delete updatedErrors[field];
          }
        });

        // Add/update errors for fields with validation errors
        Object.keys(newErrors).forEach((field) => {
          updatedErrors[field] = newErrors[field];
        });

        return updatedErrors;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, step, isOpen, touchedFields]);
  useBodyScrollLock(isOpen);
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer"
      onConfirm={handleConfirm}
      confirmLabel={
        step === 3
          ? loading
            ? "Creating Customer..."
            : "Create Customer"
          : "Next"
      }
      icon={<UserAddIcon fill="#374151" />}
      size="large"
      outSideClickClose={false}
      onCancel={handleCancel}
      cancelLabel={step === 1 ? "Cancel" : "Back"}
      confimBtnDisable={loading}
      scrollNeeded={true}
    >
      <div className="flex flex-col gap-4 sm:gap-8">
        <Stepper activeStep={step} steps={steps} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              Error creating customer: {error.message}
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4 md:gap-5">
            <div className="flex items-center flex-col sm:flex-row gap-3 md:gap-5 w-full">
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
                  className="w-full"
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
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex items-center flex-col sm:flex-row gap-3 md:gap-5 w-full">
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
                  name="phoneNo"
                  error={!!errors.phoneNo}
                  errorMessage={errors.phoneNo}
                  id="phoneNo"
                  onChange={(e) => handleChange("phoneNo", e.target.value)}
                  type="tel"
                  value={formData.phoneNo}
                  className="w-full [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <ThemeInput
              required
              label="Date of Birth"
              placeholder="MM-DD-YYYY (e.g., 01-15-1990)"
              name="dateOfBirth"
              error={!!errors.dateOfBirth}
              errorMessage={errors.dateOfBirth}
              id="dateOfBirth"
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              type="text"
              value={formData.dateOfBirth}
              maxLength={10}
            />

            <GoogleAutocompleteInput
              required
              label="Street Address"
              placeholder="Enter street address"
              name="street1"
              error={!!errors.street1}
              errorMessage={errors.street1}
              id="street1"
              value={formData.street1}
              onChange={(value) => handleChange("street1", value)}
              onAddressSelect={(address) => {
                // Auto-fill address fields when address is selected
                setFormData((prev) => ({
                  ...prev,
                  street1: address.street1,
                  city: address.city,
                  state: address.state,
                  postalCode: address.postalCode,
                }));
              }}
            />
            <ThemeInput
              label="Street Address 2 (Optional)"
              placeholder="Apartment, suite, etc. (optional)"
              name="street2"
              error={!!errors.street2}
              errorMessage={errors.street2}
              id="street2"
              onChange={(e) => handleChange("street2", e.target.value)}
              type="text"
              value={formData.street2}
            />
            <div className="flex items-center flex-col sm:flex-row gap-3 md:gap-5 w-full">
              <div className="w-full">
                <ThemeInput
                  required
                  label="City"
                  placeholder="Enter city"
                  name="city"
                  error={!!errors.city}
                  errorMessage={errors.city}
                  id="city"
                  onChange={(e) => handleChange("city", e.target.value)}
                  type="text"
                  value={formData.city}
                  className="w-full"
                />
              </div>
              <div className="w-full">
                <ThemeInput
                  required
                  label="State"
                  placeholder="Enter state"
                  name="state"
                  error={!!errors.state}
                  errorMessage={errors.state}
                  id="state"
                  onChange={(e) => handleChange("state", e.target.value)}
                  type="text"
                  value={formData.state}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-5 w-full">
              <div className="w-full">
                <ThemeInput
                  required
                  label="Postal Code"
                  placeholder="Enter postal code"
                  name="postalCode"
                  error={!!errors.postalCode}
                  errorMessage={errors.postalCode}
                  id="postalCode"
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  type="text"
                  value={formData.postalCode}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 md:gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
              <div className="w-full">
                <ThemeInput
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
                  label="Emergency Contact Phone"
                  placeholder="(316) 555-0116"
                  name="emergencyPhone"
                  error={!!errors.emergencyPhone}
                  errorMessage={errors.emergencyPhone}
                  id="emergencyPhone"
                  onChange={(e) =>
                    handleChange("emergencyPhone", e.target.value)
                  }
                  type="tel"
                  value={formData.emergencyPhone}
                  className="w-full [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
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
          <div className="flex flex-col gap-4 md:gap-4">
            <TextAreaField
              label="Additional Notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Enter any additional notes about the customer"
              // required
            />
          </div>
        )}
      </div>
    </AppModal>
  );
};

export default AddCustomerModal;
