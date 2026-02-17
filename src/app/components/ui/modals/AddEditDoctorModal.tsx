/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import AppModal, { ModalPosition } from "./AppModal";
import { DoctorIcon, CrossIcon, PlusIcon, TrashBinIcon, EyeIcon } from "@/icons";
import { ImageUpload, GoogleAutocompleteInput, Dropdown } from "@/app/components";
import { US_STATES } from "@/lib/constants";
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

/** Extract filename from Rails Active Storage URL */
const getFilenameFromActiveStorageUrl = (url: string): string => {
  if (!url) return "Existing document";
  const path = url.split("?")[0];
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return last || "Existing document";
};

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
    npiNumber: "",
    specialty: "",
    hasDeaLicense: "No" as "Yes" | "No",
    deaLicenseNumber: "",
    deaLicenseState: "",
    deaLicenseExpirationDate: "",
    status: "Active",
    clinic: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [deaLicenseDocument, setDeaLicenseDocument] = useState<File | null>(null);
  const deaLicenseFileInputRef = React.useRef<HTMLInputElement>(null);
  const [deaLicenseEntries, setDeaLicenseEntries] = useState<
    Array<{ id?: string | number; licenseUrl?: string | null; deaLicenseNumber: string; deaLicenseState: string; deaLicenseExpirationDate: string; deaLicenseDocument: File | null; delete?: boolean }>
  >([]);
  const [firstDeaLicenseId, setFirstDeaLicenseId] = useState<string | number | null>(null);
  const [firstDeaLicenseUrl, setFirstDeaLicenseUrl] = useState<string | null>(null);
  const [deletedLicenses, setDeletedLicenses] = useState<Array<{ id: string | number; deaLicense: string; state: string; expirationDate: string }>>([]);
  const deaLicenseEntryFileRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const isMobile = useIsMobile();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const addSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNo: Yup.string()
      .required("Phone number is required")
      .matches(
        /^\(\d{3}\)\s\d{3}-\d{4}$/,
        "Phone number must be in format (000) 000-0000",
      ),
    npiNumber: Yup.string().required("NPI number is required"),
    specialty: Yup.string().required("Specialty is required"),
    status: Yup.string().oneOf(["Active", "Inactive"]).required(),
  });

  const editSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    phoneNo: Yup.string()
      .required("Phone number is required")
      .matches(
        /^\(\d{3}\)\s\d{3}-\d{4}$/,
        "Phone number must be in format (000) 000-0000"
      ),
    email: Yup.string().email("Invalid email").required("Email is required"),
    npiNumber: Yup.string().required("NPI number is required"),
    specialty: Yup.string().required("Specialty is required"),
    status: Yup.string().oneOf(["Active", "Inactive"]).required(),
    hasDeaLicense: Yup.string().oneOf(["Yes", "No"]).required(),
    deaLicenseNumber: Yup.string().when("hasDeaLicense", {
      is: "Yes",
      then: (s) => s.required("DEA License number is required"),
      otherwise: (s) => s.optional(),
    }),
    deaLicenseState: Yup.string().when("hasDeaLicense", {
      is: "Yes",
      then: (s) => s.required("DEA License state is required"),
      otherwise: (s) => s.optional(),
    }),
    deaLicenseExpirationDate: Yup.string().when("hasDeaLicense", {
      is: "Yes",
      then: (s) =>
        s
          .required("DEA License expiration date is required")
          .matches(/^\d{2}-\d{2}-\d{4}$/, "Date must be in format MM-DD-YYYY (e.g., 01-15-1990)")
          .test("valid-date", "Please enter a valid date", (value) => {
            if (!value) return false;
            const [month, day, year] = value.split("-").map(Number);
            const date = new Date(year, month - 1, day);
            return date instanceof Date && !isNaN(date.getTime()) && date.getMonth() === month - 1 && date.getDate() === day && date.getFullYear() === year;
          })
          .test("future-date", "Expiration date must be in the future", (value) => {
            if (!value) return false;
            const [month, day, year] = value.split("-").map(Number);
            const date = new Date(year, month - 1, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            return date > today;
          }),
      otherwise: (s) => s.optional(),
    }),
    clinic: Yup.string().optional(),
    street1: Yup.string().optional(),
    street2: Yup.string().optional(),
    city: Yup.string().optional(),
    state: Yup.string().optional(),
    postalCode: Yup.string().optional(),
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
    },
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

  const formatDate = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 8);
    if (limited.length === 0) return "";
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)}-${limited.slice(2)}`;
    return `${limited.slice(0, 2)}-${limited.slice(2, 4)}-${limited.slice(4)}`;
  };

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
      6,
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

  const addDeaLicenseEntry = () => {
    setDeaLicenseEntries((prev) => [
      ...prev,
      { deaLicenseNumber: "", deaLicenseState: "", deaLicenseExpirationDate: "", deaLicenseDocument: null },
    ]);
  };

  const updateDeaLicenseEntry = (
    index: number,
    field: "deaLicenseNumber" | "deaLicenseState" | "deaLicenseExpirationDate" | "deaLicenseDocument" | "licenseUrl" | "delete" | "id",
    value: string | File | null | boolean
  ) => {
    setDeaLicenseEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeDeaLicenseEntry = (index: number) => {
    setDeaLicenseEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], delete: true };
      return next;
    });
  };

  const removeFirstDeaLicenseChunk = () => {
    if (firstDeaLicenseId != null) {
      const toExp = (mmddyyyy: string) => {
        if (!mmddyyyy) return "";
        const [mm, dd, yyyy] = mmddyyyy.split("-");
        return yyyy && mm && dd ? `${yyyy}-${mm}-${dd}` : mmddyyyy;
      };
      setDeletedLicenses((prev) => [
        ...prev,
        { id: firstDeaLicenseId, deaLicense: formData.deaLicenseNumber, state: formData.deaLicenseState, expirationDate: toExp(formData.deaLicenseExpirationDate) },
      ]);
    }
    const firstNonDeletedIndex = deaLicenseEntries.findIndex((e) => !e.delete);
    if (firstNonDeletedIndex === -1) return;
    const first = deaLicenseEntries[firstNonDeletedIndex];
    setFirstDeaLicenseId(first.id ?? null);
    setFirstDeaLicenseUrl(first.licenseUrl ?? null);
    setFormData((prev) => ({
      ...prev,
      deaLicenseNumber: first.deaLicenseNumber,
      deaLicenseState: first.deaLicenseState,
      deaLicenseExpirationDate: first.deaLicenseExpirationDate,
    }));
    setDeaLicenseDocument(first.deaLicenseDocument);
    setDeaLicenseEntries((prev) => prev.filter((_, i) => i !== firstNonDeletedIndex));
    if (deaLicenseFileInputRef.current) deaLicenseFileInputRef.current.value = "";
  };

  const validateDeaLicenseField = async (field: "deaLicenseNumber" | "deaLicenseState" | "deaLicenseExpirationDate") => {
    if (formData.hasDeaLicense !== "Yes" || !initialData) return;
    try {
      await editSchema.validateAt(field, formData);
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    } catch (err: unknown) {
      setErrors((prev) => ({
        ...prev,
        [field]: (err as { message?: string })?.message || "Invalid value",
      }));
    }
  };

  const validateForm = async () => {
    const currentSchema = initialData ? editSchema : addSchema;
    try {
      await currentSchema.validate(formData, { abortEarly: false });
      const newErrors: Record<string, string> = {};
      if (initialData && formData.hasDeaLicense === "Yes") {
        if (!deaLicenseDocument && !firstDeaLicenseUrl) newErrors.deaLicenseDocument = "License document is required";
        deaLicenseEntries.forEach((entry, index) => {
          if (entry.delete) return;
          if (!entry.deaLicenseNumber) newErrors[`deaLicenseEntries.${index}.deaLicenseNumber`] = "DEA License number is required";
          if (!entry.deaLicenseState) newErrors[`deaLicenseEntries.${index}.deaLicenseState`] = "DEA License state is required";
          if (!entry.deaLicenseExpirationDate) newErrors[`deaLicenseEntries.${index}.deaLicenseExpirationDate`] = "DEA License expiration date is required";
          if (!entry.deaLicenseDocument && !entry.licenseUrl) newErrors[`deaLicenseEntries.${index}.deaLicenseDocument`] = "License document is required";
        });
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        const firstKey = Object.keys(newErrors)[0];
        const scrollId = firstKey === "deaLicenseDocument" ? "deaLicenseDocument" : firstKey;
        setTimeout(() => document.getElementById(scrollId)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
        return false;
      }
      setErrors({});
      return true;
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      err.inner?.forEach((e: any) => {
        if (e.path) newErrors[e.path] = e.message;
      });
      if (initialData && formData.hasDeaLicense === "Yes") {
        if (!deaLicenseDocument && !firstDeaLicenseUrl) newErrors.deaLicenseDocument = "License document is required";
        deaLicenseEntries.forEach((entry, index) => {
          if (entry.delete) return;
          if (!entry.deaLicenseNumber) newErrors[`deaLicenseEntries.${index}.deaLicenseNumber`] = "DEA License number is required";
          if (!entry.deaLicenseState) newErrors[`deaLicenseEntries.${index}.deaLicenseState`] = "DEA License state is required";
          if (!entry.deaLicenseExpirationDate) newErrors[`deaLicenseEntries.${index}.deaLicenseExpirationDate`] = "DEA License expiration date is required";
          if (!entry.deaLicenseDocument && !entry.licenseUrl) newErrors[`deaLicenseEntries.${index}.deaLicenseDocument`] = "License document is required";
        });
      }
      setErrors(newErrors);
      const firstKey = err.inner?.[0]?.path || Object.keys(newErrors)[0];
      const scrollId = firstKey === "deaLicenseDocument" ? "deaLicenseDocument" : firstKey;
      if (scrollId) setTimeout(() => document.getElementById(scrollId)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      return false;
    }
  };

  const toFormExpirationDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "";
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      const [a, b, c] = parts;
      if (a?.length === 4) return `${b}-${c}-${a}`;
      return `${a}-${b}-${c}`;
    }
    return dateStr;
  };

  const handleConfirm = async () => {
    const valid = await validateForm();

    if (valid) {
      try {
        const { hasDeaLicense: _h, deaLicenseNumber: _n, deaLicenseState: _s, deaLicenseExpirationDate: _e, ...formDataForApi } = formData;
        const variables = {
          ...formDataForApi,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          status: formData.status.toUpperCase(),
          image: selectedImage,
          street1: formData.street1 || null,
          street2: formData.street2 || null,
          city: formData.city || null,
          state: formData.state || null,
          postalCode: formData.postalCode || null,
          address: formData.street1
            ? `${formData.street1}${formData.street2 ? `, ${formData.street2}` : ""}, ${formData.city}, ${formData.state} ${formData.postalCode}`
            : null,
        };

        if (initialData) {
          const updateVariables: Record<string, unknown> = { id: initialData.id, ...variables };
          if (formData.hasDeaLicense === "Yes") {
            const toExpiration = (mmddyyyy: string) => {
              if (!mmddyyyy) return "";
              const [mm, dd, yyyy] = mmddyyyy.split("-");
              return yyyy && mm && dd ? `${yyyy}-${mm}-${dd}` : mmddyyyy;
            };
            type LicensePayload = { id?: string | number; deaLicense?: string; state?: string; expirationDate?: string; license?: File; delete?: boolean };
            const existingLicenses = initialData?.deaLicenses ?? [];
            const licenses: LicensePayload[] = [];
            const firstExpirationFormatted = toExpiration(formData.deaLicenseExpirationDate);
            const firstKeep = !!(deaLicenseDocument || firstDeaLicenseUrl);
            if (firstKeep) {
              const firstLicense: LicensePayload = { deaLicense: formData.deaLicenseNumber, state: formData.deaLicenseState, expirationDate: firstExpirationFormatted };
              if (firstDeaLicenseId != null) firstLicense.id = firstDeaLicenseId;
              if (deaLicenseDocument) firstLicense.license = deaLicenseDocument;
              licenses.push(firstLicense);
            } else if (firstDeaLicenseId != null) {
              licenses.push({ id: firstDeaLicenseId, deaLicense: formData.deaLicenseNumber, state: formData.deaLicenseState, expirationDate: firstExpirationFormatted, delete: true });
            }
            deletedLicenses.forEach((d) => licenses.push({ id: d.id, deaLicense: d.deaLicense, state: d.state, expirationDate: d.expirationDate, delete: true }));
            deaLicenseEntries.forEach((entry, i) => {
              const expirationDateFormatted = toExpiration(entry.deaLicenseExpirationDate);
              const existingId = existingLicenses[i + 1]?.id ?? entry.id;
              if (entry.delete && (entry.id != null || existingId != null)) {
                licenses.push({ id: entry.id ?? existingId, deaLicense: entry.deaLicenseNumber, state: entry.deaLicenseState, expirationDate: expirationDateFormatted, delete: true });
              } else if (!entry.delete && (entry.deaLicenseDocument || entry.licenseUrl)) {
                const entryLicense: LicensePayload = { deaLicense: entry.deaLicenseNumber, state: entry.deaLicenseState, expirationDate: expirationDateFormatted };
                if (entry.id != null || existingId != null) entryLicense.id = (entry.id ?? existingId) as string | number;
                if (entry.deaLicenseDocument) entryLicense.license = entry.deaLicenseDocument;
                licenses.push(entryLicense);
              }
            });
            updateVariables.deaLicensesAttributes = licenses.length > 0 ? licenses : undefined;
          } else if ((initialData?.deaLicenses?.length ?? 0) > 0) {
            updateVariables.deaLicensesAttributes = (initialData.deaLicenses ?? []).map((d) => ({
              id: d.id!,
              deaLicense: d.deaLicense ?? "",
              state: d.state ?? "",
              expirationDate: d.expirationDate ?? "",
              delete: true,
            }));
          }
          await updateUser({ variables: updateVariables });
        } else {
          // Add mode - only first name, last name, email, status
          await createInvitation({
            variables: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phoneNo: formData.phoneNo || null,
              npiNumber: formData.npiNumber || null,
              specialty: formData.specialty || null,
              status: formData.status.toUpperCase(),
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
        const deaLicenses = initialData.deaLicenses ?? [];
        const firstDea = deaLicenses[0];
        const hasDea = deaLicenses.length > 0;
        const nameParts = (initialData.fullName || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        setFormData({
          firstName: initialData.firstName || firstName,
          lastName: initialData.lastName || lastName,
          phoneNo: initialData.phoneNo || "",
          email: initialData.email || "",
          npiNumber: initialData.npiNumber || "",
          specialty: initialData.specialty || "",
          hasDeaLicense: hasDea ? "Yes" : "No",
          deaLicenseNumber: firstDea?.deaLicense ?? "",
          deaLicenseState: firstDea?.state ?? "",
          deaLicenseExpirationDate: toFormExpirationDate(firstDea?.expirationDate),
          status: initialData.status === "ACTIVE" ? "Active" : initialData.status === "INACTIVE" ? "Inactive" : "Active",
          clinic: initialData.clinic || "",
          street1: initialData.street1 || "",
          street2: initialData.street2 || "",
          city: initialData.city || "",
          state: initialData.state || "",
          postalCode: initialData.postalCode || "",
        });
        setSelectedUser(initialData.specialty || "");
        setDeaLicenseDocument(null);
        setFirstDeaLicenseId(firstDea?.id ?? null);
        setFirstDeaLicenseUrl(firstDea?.licenseUrl ?? null);
        setDeletedLicenses([]);
        setDeaLicenseEntries(
          deaLicenses.slice(1).map((d) => ({
            id: d.id,
            licenseUrl: d.licenseUrl,
            deaLicenseNumber: d.deaLicense ?? "",
            deaLicenseState: d.state ?? "",
            deaLicenseExpirationDate: toFormExpirationDate(d.expirationDate),
            deaLicenseDocument: null,
          }))
        );
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          phoneNo: "",
          email: "",
          npiNumber: "",
          specialty: "",
          hasDeaLicense: "No",
          deaLicenseNumber: "",
          deaLicenseState: "",
          deaLicenseExpirationDate: "",
          status: "Active",
          clinic: "",
          street1: "",
          street2: "",
          city: "",
          state: "",
          postalCode: "",
        });
        setSelectedUser("");
        setDeaLicenseDocument(null);
        setDeaLicenseEntries([]);
        setFirstDeaLicenseId(null);
        setFirstDeaLicenseUrl(null);
        setDeletedLicenses([]);
      }
      setSelectedImage(null);
      setErrors({});
      setSpecialtySearchTerm("");
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const { firstName, lastName, email, status, hasDeaLicense, deaLicenseNumber, deaLicenseState, deaLicenseExpirationDate, street1, city, state, postalCode } = formData;

    if (initialData) {
      const { phoneNo, npiNumber, specialty } = formData;
      let valid = !!firstName && !!lastName && !!phoneNo && !!email && !!npiNumber && !!specialty && !!status;
      if (hasDeaLicense === "Yes") {
        if (!deaLicenseNumber || !deaLicenseState || !deaLicenseExpirationDate || (!deaLicenseDocument && !firstDeaLicenseUrl)) valid = false;
        const entryIncomplete = deaLicenseEntries.some(
          (e) => !e.delete && (!e.deaLicenseNumber || !e.deaLicenseState || !e.deaLicenseExpirationDate || (!e.deaLicenseDocument && !e.licenseUrl))
        );
        if (entryIncomplete) valid = false;
      }
      setIsFormValid(valid);
    } else {
      const { phoneNo, npiNumber, specialty } = formData;
      setIsFormValid(!!firstName && !!lastName && !!email && !!phoneNo && !!npiNumber && !!specialty && !!status);
    }
  }, [formData, initialData, deaLicenseDocument, deaLicenseEntries, firstDeaLicenseUrl]);

  // Debug button state
  useEffect(() => {
    console.log("🔘 Button state:", {
      isFormValid,
      loading,
      buttonDisabled: !isFormValid || loading,
    });
  }, [isFormValid, loading]);

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
      size="extraLarge"
      outSideClickClose={false}
      confimBtnDisable={!isFormValid || loading}
      onCancel={handleCancel}
      cancelLabel={"Cancel"}
      position={ModalPosition.RIGHT}
    >
      <div className="flex flex-col gap-3 md:gap-5">
        {initialData ? (
          <>
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
                  placeholder="(000) 000-0000"
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
                  label="NPI number"
                  placeholder="Enter license number"
                  name="npiNumber"
                  error={!!errors.npiNumber}
                  errorMessage={errors.npiNumber}
                  id="npiNumber"
                  onChange={(e) => handleChange("npiNumber", e.target.value)}
                  type="text"
                  value={formData.npiNumber}
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
            <ThemeInput
              label="Clinic"
              placeholder="Enter clinic name"
              name="clinic"
              error={!!errors.clinic}
              errorMessage={errors.clinic}
              id="clinic"
              onChange={(e) => handleChange("clinic", e.target.value)}
              type="text"
              value={formData.clinic}
            />
            <div className="flex items-start flex-col sm:flex-row gap-3 md:gap-5">
              <div className="w-full">
                <label className="mb-1.5 font-medium text-gray-700 text-xs md:text-sm block">DEA License</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="Yes"
                      name="hasDeaLicense"
                      checked={formData.hasDeaLicense === "Yes"}
                      onChange={(e) => handleChange("hasDeaLicense", e.target.value as "Yes" | "No")}
                      className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="No"
                      name="hasDeaLicense"
                      checked={(formData.hasDeaLicense || "No") === "No"}
                      onChange={(e) => handleChange("hasDeaLicense", e.target.value as "Yes" | "No")}
                      className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                    />
                    No
                  </label>
                </div>
              </div>
              <div className="w-full">
                <label className="mb-1.5 font-medium text-gray-700 text-xs md:text-sm block">Status</label>
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
                {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
              </div>
            </div>

            {formData.hasDeaLicense === "Yes" && (
              <div className="bg-gray-100 p-3 rounded-lg space-y-4">
                <div className="flex items-start flex-col sm:flex-row gap-3 md:gap-5">
                  <div className="w-full" id="deaLicenseNumber">
                    <ThemeInput
                      required
                      label="DEA License"
                      placeholder="Enter DEA License number"
                      name="deaLicenseNumber"
                      error={!!errors.deaLicenseNumber}
                      errorMessage={errors.deaLicenseNumber}
                      id="deaLicenseNumber-input"
                      onChange={(e) => { handleChange("deaLicenseNumber", e.target.value); if (errors.deaLicenseNumber) setErrors((p) => { const n = { ...p }; delete n.deaLicenseNumber; return n; }); }}
                      onBlur={() => validateDeaLicenseField("deaLicenseNumber")}
                      type="text"
                      value={formData.deaLicenseNumber}
                    />
                  </div>
                  <div className="w-full" id="deaLicenseState">
                    <Dropdown
                      label="State"
                      placeholder="Select state"
                      options={US_STATES}
                      value={formData.deaLicenseState}
                      onChange={(value) => { handleChange("deaLicenseState", value); if (errors.deaLicenseState) setErrors((p) => { const n = { ...p }; delete n.deaLicenseState; return n; }); }}
                      required
                      error={!!errors.deaLicenseState}
                      errorMessage={errors.deaLicenseState}
                      showSearch
                      searchPlaceholder="Search states..."
                    />
                  </div>
                  <div className="w-full" id="deaLicenseExpirationDate">
                    <ThemeInput
                      required
                      label="DEA License Expiration"
                      type="text"
                      name="deaLicenseExpirationDate"
                      value={formData.deaLicenseExpirationDate}
                      onChange={(e) => { const formatted = formatDate(e.target.value); handleChange("deaLicenseExpirationDate", formatted); if (errors.deaLicenseExpirationDate) setErrors((p) => { const n = { ...p }; delete n.deaLicenseExpirationDate; return n; }); }}
                      onBlur={() => validateDeaLicenseField("deaLicenseExpirationDate")}
                      placeholder="MM-DD-YYYY (e.g., 01-15-2026)"
                      maxLength={10}
                      error={!!errors.deaLicenseExpirationDate}
                      errorMessage={errors.deaLicenseExpirationDate}
                      id="deaLicenseExpirationDate-input"
                    />
                  </div>
                </div>
                <div className="mt-4" id="deaLicenseDocument">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Upload License Document <span className="text-red-600">*</span></label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center rounded-lg border border-lightGray bg-white overflow-hidden">
                      <button type="button" onClick={() => deaLicenseFileInputRef.current?.click()} className="px-4 py-2.5 text-sm font-medium text-gray-700 border-r border-lightGray hover:bg-gray-50">
                        Choose file
                      </button>
                      <span className="flex-1 px-4 py-2.5 text-sm text-gray-900 truncate">
                        {deaLicenseDocument?.name || (firstDeaLicenseUrl ? getFilenameFromActiveStorageUrl(firstDeaLicenseUrl) : "No file chosen")}
                      </span>
                      {deaLicenseDocument && (
                        <button type="button" onClick={() => { setDeaLicenseDocument(null); if (deaLicenseFileInputRef.current) deaLicenseFileInputRef.current.value = ""; }} className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50" aria-label="Remove file">
                          <CrossIcon width="18" height="18" fill="currentColor" />
                        </button>
                      )}
                    </div>
                    {firstDeaLicenseUrl && (
                      <div className="flex items-center gap-2">
                        <a href={`${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${firstDeaLicenseUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:underline rounded-md border border-primary/30 bg-primary/5">
                          <EyeIcon /> Preview
                        </a>
                        <button type="button" onClick={() => setFirstDeaLicenseUrl(null)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md border border-red-200" aria-label="Delete license">
                          <TrashBinIcon width="14" height="14" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <input ref={deaLicenseFileInputRef} type="file" className="hidden" accept=".pdf,application/pdf,image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp" onChange={(e) => { setDeaLicenseDocument(e.target.files?.[0] || null); if (errors.deaLicenseDocument) setErrors((p) => { const n = { ...p }; delete n.deaLicenseDocument; return n; }); }} />
                  {errors.deaLicenseDocument && <p className="mt-1.5 text-sm font-medium text-red-600" role="alert">{errors.deaLicenseDocument}</p>}
                </div>
                {deaLicenseEntries.some((e) => !e.delete) && (
                  <div className="flex justify-end">
                    <button type="button" onClick={removeFirstDeaLicenseChunk} className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium" aria-label="Remove license entry">
                      <TrashBinIcon width="12" height="12" fill="currentColor" /> Remove
                    </button>
                  </div>
                )}
                {deaLicenseEntries
                  .map((entry, index) => ({ entry, index }))
                  .filter(({ entry }) => !entry.delete)
                  .map(({ entry, index }) => {
                  const entryError = (f: string) => errors[`deaLicenseEntries.${index}.${f}`];
                  const clearEntryError = (f: string) => { const key = `deaLicenseEntries.${index}.${f}`; if (errors[key]) setErrors((p) => { const n = { ...p }; delete n[key]; return n; }); };
                  return (
                    <div key={entry.id ?? index} className="space-y-4 mt-4">
                      <div className="flex items-start flex-col sm:flex-row gap-3 md:gap-5">
                        <div className="w-full">
                          <ThemeInput label="DEA License" placeholder="Enter DEA License number" value={entry.deaLicenseNumber} onChange={(e) => { updateDeaLicenseEntry(index, "deaLicenseNumber", e.target.value); clearEntryError("deaLicenseNumber"); }} error={!!entryError("deaLicenseNumber")} errorMessage={entryError("deaLicenseNumber")} type="text" />
                        </div>
                        <div className="w-full">
                          <Dropdown label="State" placeholder="Select state" options={US_STATES} value={entry.deaLicenseState} onChange={(value) => { updateDeaLicenseEntry(index, "deaLicenseState", value); clearEntryError("deaLicenseState"); }} showSearch searchPlaceholder="Search states..." error={!!entryError("deaLicenseState")} errorMessage={entryError("deaLicenseState")} />
                        </div>
                        <div className="w-full">
                          <ThemeInput label="DEA License Expiration" type="text" value={entry.deaLicenseExpirationDate} onChange={(e) => { updateDeaLicenseEntry(index, "deaLicenseExpirationDate", formatDate(e.target.value)); clearEntryError("deaLicenseExpirationDate"); }} placeholder="MM-DD-YYYY (e.g., 01-15-2026)" maxLength={10} error={!!entryError("deaLicenseExpirationDate")} errorMessage={entryError("deaLicenseExpirationDate")} />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Upload License Document <span className="text-red-600">*</span></label>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center rounded-lg border border-lightGray bg-white overflow-hidden">
                            <button type="button" onClick={() => deaLicenseEntryFileRefs.current[index]?.click()} className="cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-700 border-r border-lightGray hover:bg-gray-50">Choose file</button>
                            <span className="flex-1 px-4 py-2.5 text-sm text-gray-900 truncate">{entry.deaLicenseDocument?.name || (entry.licenseUrl ? getFilenameFromActiveStorageUrl(entry.licenseUrl) : "No file chosen")}</span>
                            {entry.deaLicenseDocument && (
                              <button type="button" onClick={() => { updateDeaLicenseEntry(index, "deaLicenseDocument", null); const input = deaLicenseEntryFileRefs.current[index]; if (input) input.value = ""; clearEntryError("deaLicenseDocument"); }} className="cursor-pointer p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50" aria-label="Remove file">
                                <CrossIcon width="18" height="18" fill="currentColor" />
                              </button>
                            )}
                          </div>
                          {entry.licenseUrl && (
                            <div className="flex items-center gap-2">
                              <a href={`${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${entry.licenseUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:underline rounded-md border border-primary/30 bg-primary/5"><EyeIcon /> Preview</a>
                              <button type="button" onClick={() => updateDeaLicenseEntry(index, "licenseUrl", null)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md border border-red-200" aria-label="Delete license"><TrashBinIcon width="14" height="14" /> Delete</button>
                            </div>
                          )}
                        </div>
                        <input ref={(el) => { deaLicenseEntryFileRefs.current[index] = el; }} type="file" className="hidden" accept=".pdf,application/pdf,image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp" onChange={(e) => { updateDeaLicenseEntry(index, "deaLicenseDocument", e.target.files?.[0] || null); clearEntryError("deaLicenseDocument"); }} />
                        {entryError("deaLicenseDocument") && <p className="mt-1.5 text-sm font-medium text-red-600" role="alert">{entryError("deaLicenseDocument")}</p>}
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={() => removeDeaLicenseEntry(index)} className="cursor-pointer flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium" aria-label="Remove license entry">
                          <TrashBinIcon width="12" height="12" fill="currentColor" /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
                <button type="button" onClick={addDeaLicenseEntry} className="mt-4 flex items-center gap-2 text-primary font-medium hover:underline cursor-pointer">
                  <PlusIcon width="20" height="20" /> Add New
                </button>
              </div>
            )}

            <GoogleAutocompleteInput
              label="Street Address"
              placeholder="Enter street address"
              name="street1"
              error={!!errors.street1}
              errorMessage={errors.street1}
              id="street1"
              value={formData.street1}
              onChange={(value) => handleChange("street1", value)}
              onAddressSelect={(address) => {
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
          </>
        ) : (
          <>
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
                  placeholder="(000) 000-0000"
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
                  label="NPI number"
                  placeholder="Enter license number"
                  name="npiNumber"
                  error={!!errors.npiNumber}
                  errorMessage={errors.npiNumber}
                  id="npiNumber"
                  onChange={(e) => handleChange("npiNumber", e.target.value)}
                  type="text"
                  value={formData.npiNumber}
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
              <label className="mb-1.5 font-medium text-gray-700 text-xs md:text-sm block" htmlFor="">
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
              {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
            </div>
          </>
        )}
      </div>
    </AppModal>
  );
};

export default AddEditDoctorModal;
