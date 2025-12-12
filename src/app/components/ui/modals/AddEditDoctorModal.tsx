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
import { useIsMobile } from "@/hooks/useIsMobile";

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
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    medicalLicense: "",
    specialty: "",
    status: "Active",
    street1: "",
    street2: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const isMobile = useIsMobile();
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
    medicalLicense: Yup.string().required("Medical License is required"),
    specialty: Yup.string().required("Specialty is required"),
    status: Yup.string().oneOf(["Active", "Inactive"]).required(),
    street1: Yup.string().required("Street address is required"),
    street2: Yup.string().optional(),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    postalCode: Yup.string().required("Postal code is required"),
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
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          status: formData.status.toUpperCase(),
          image: selectedImage,
          street1: formData.street1 || null,
          street2: formData.street2 || null,
          city: formData.city || null,
          state: formData.state || null,
          postalCode: formData.postalCode || null,
          address: formData.street1
            ? `${formData.street1}${
                formData.street2 ? `, ${formData.street2}` : ""
              }, ${formData.city}, ${formData.state} ${formData.postalCode}`
            : null,
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
        // Split fullName into firstName and lastName if available
        const nameParts = (initialData.fullName || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        setFormData({
          firstName: initialData.firstName || firstName,
          lastName: initialData.lastName || lastName,
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
          street1: initialData.street1 || "",
          street2: initialData.street2 || "",
          city: initialData.city || "",
          state: initialData.state || "",
          postalCode: initialData.postalCode || "",
        });
        setSelectedUser(initialData.specialty || "");
      } else {
        // Add mode
        setFormData({
          firstName: "",
          lastName: "",
          phoneNo: "",
          email: "",
          medicalLicense: "",
          specialty: "",
          status: "Active",
          street1: "",
          street2: "",
          city: "",
          state: "",
          postalCode: "",
        });
        setSelectedUser("");
      }
      setSelectedImage(null);
      setErrors({});
      setSpecialtySearchTerm("");
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const {
      firstName,
      lastName,
      phoneNo,
      email,
      medicalLicense,
      specialty,
      status,
      street1,
      city,
      state,
      postalCode,
    } = formData;
    if (
      firstName &&
      lastName &&
      phoneNo &&
      email &&
      medicalLicense &&
      specialty &&
      status &&
      street1 &&
      city &&
      state &&
      postalCode
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [formData]);

  const specialities = [
    { name: "cardiology", displayName: "Cardiology" },
    { name: "dermatology", displayName: "Dermatology" },
    { name: "neurology", displayName: "Neurology" },
    { name: "orthopedics", displayName: "Orthopedics" },
    { name: "pediatrics", displayName: "Pediatrics" },
    { name: "psychiatry", displayName: "Psychiatry" },
    { name: "gynecology", displayName: "Gynecology" },
    { name: "obstetrics", displayName: "Obstetrics" },
    { name: "oncology", displayName: "Oncology" },
    { name: "radiology", displayName: "Radiology" },
    { name: "urology", displayName: "Urology" },
    { name: "gastroenterology", displayName: "Gastroenterology" },
    { name: "endocrinology", displayName: "Endocrinology" },
    { name: "nephrology", displayName: "Nephrology" },
    { name: "pulmonology", displayName: "Pulmonology" },
    { name: "general_surgery", displayName: "General Surgery" },
    { name: "dentistry", displayName: "Dentistry" },
    { name: "ophthalmology", displayName: "Ophthalmology" },
    { name: "ent", displayName: "ENT (Ear, Nose, Throat)" },
    { name: "rheumatology", displayName: "Rheumatology" },
    { name: "family_medicine", displayName: "Family Medicine" },
    { name: "internal_medicine", displayName: "Internal Medicine" },
    { name: "anesthesiology", displayName: "Anesthesiology" },
    { name: "pathology", displayName: "Pathology" },
    { name: "hematology", displayName: "Hematology" },
    { name: "allergy_immunology", displayName: "Allergy & Immunology" },
    { name: "infectious_disease", displayName: "Infectious Disease" },
    { name: "plastic_surgery", displayName: "Plastic Surgery" },
    { name: "vascular_surgery", displayName: "Vascular Surgery" },
    { name: "thoracic_surgery", displayName: "Thoracic Surgery" },
    { name: "colorectal_surgery", displayName: "Colorectal Surgery" },
    { name: "neurosurgery", displayName: "Neurosurgery" },
    { name: "emergency_medicine", displayName: "Emergency Medicine" },
    { name: "sports_medicine", displayName: "Sports Medicine" },
    { name: "geriatrics", displayName: "Geriatrics" },
    { name: "palliative_medicine", displayName: "Palliative Medicine" },
    { name: "pain_management", displayName: "Pain Management" },
    { name: "sleep_medicine", displayName: "Sleep Medicine" },
    { name: "nuclear_medicine", displayName: "Nuclear Medicine" },
    {
      name: "reproductive_endocrinology",
      displayName: "Reproductive Endocrinology",
    },
    { name: "neonatology", displayName: "Neonatology" },
    { name: "medical_genetics", displayName: "Medical Genetics" },
    { name: "addiction_medicine", displayName: "Addiction Medicine" },
    { name: "occupational_medicine", displayName: "Occupational Medicine" },
    { name: "preventive_medicine", displayName: "Preventive Medicine" },
    { name: "critical_care", displayName: "Critical Care Medicine" },
    { name: "trauma_surgery", displayName: "Trauma Surgery" },
    { name: "bariatric_surgery", displayName: "Bariatric Surgery" },
    { name: "hand_surgery", displayName: "Hand Surgery" },
    { name: "foot_ankle_surgery", displayName: "Foot & Ankle Surgery" },
    { name: "maxillofacial_surgery", displayName: "Maxillofacial Surgery" },
    { name: "otolaryngology", displayName: "Otolaryngology" },
    { name: "phlebology", displayName: "Phlebology" },
    { name: "cosmetic_surgery", displayName: "Cosmetic Surgery" },
    { name: "dermatopathology", displayName: "Dermatopathology" },
    {
      name: "interventional_radiology",
      displayName: "Interventional Radiology",
    },
    { name: "maternal_fetal_medicine", displayName: "Maternal–Fetal Medicine" },
    { name: "pediatric_surgery", displayName: "Pediatric Surgery" },
    { name: "pediatric_cardiology", displayName: "Pediatric Cardiology" },
    { name: "pediatric_neurology", displayName: "Pediatric Neurology" },
    { name: "pediatric_endocrinology", displayName: "Pediatric Endocrinology" },
    { name: "pediatric_nephrology", displayName: "Pediatric Nephrology" },
    { name: "pediatric_oncology", displayName: "Pediatric Oncology" },
    {
      name: "pediatric_gastroenterology",
      displayName: "Pediatric Gastroenterology",
    },
    { name: "pulmonary_critical_care", displayName: "Pulmonary Critical Care" },
    { name: "cardiothoracic_surgery", displayName: "Cardiothoracic Surgery" },
    { name: "chiropractic_medicine", displayName: "Chiropractic Medicine" },
    {
      name: "speech_language_therapy",
      displayName: "Speech & Language Therapy",
    },
    { name: "physiotherapy", displayName: "Physiotherapy" },
  ];

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
      <div className="flex flex-col gap-3 md:gap-5">
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
          width={isMobile ? 72 : 96}
          height={isMobile ? 72 : 96}
          className="border-b-0"
        />

        <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-5">
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
        <div className="flex items-start gap-2 md:gap-5">
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

        <div className="flex items-start flex-col sm:flex-row gap-3 md:gap-5">
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
              groups={specialities}
              name="Specialty"
              multiple={false}
              placeholder="Select specialty"
              searchTerm={specialtySearchTerm}
              setSearchTerm={setSpecialtySearchTerm}
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

        <ThemeInput
          required
          label="Street Address"
          placeholder="Enter street address"
          name="street1"
          error={!!errors.street1}
          errorMessage={errors.street1}
          id="street1"
          onChange={(e) => handleChange("street1", e.target.value)}
          type="text"
          value={formData.street1}
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
            />
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default AddEditDoctorModal;
