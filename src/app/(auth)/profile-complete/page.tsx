"use client";

import {
  AuthHeader,
  GoogleAutocompleteInput,
  ImageUpload,
  Loader,
  ProfileStepper,
  SelectGroupDropdown,
  ThemeButton,
  ThemeInput,
  Dropdown,
} from "@/app/components";
import { Images } from "@/app/ui/images";
import { CrossIcon, EyeIcon, PlusIcon, TrashBinIcon } from "@/icons";
import { useIsMobile } from "@/hooks/useIsMobile";
import { US_STATES } from "@/lib/constants";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";
import { useMutation } from "@apollo/client";
import { UPDATE_DOCTOR } from "@/lib/graphql/mutations";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import Cookies from "js-cookie";
import * as Yup from "yup";

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Address Info" },
  { id: 3, label: "DEA license" },
];

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
  { name: "reproductive_endocrinology", displayName: "Reproductive Endocrinology" },
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
  { name: "interventional_radiology", displayName: "Interventional Radiology" },
  { name: "maternal_fetal_medicine", displayName: "Maternal–Fetal Medicine" },
  { name: "pediatric_surgery", displayName: "Pediatric Surgery" },
  { name: "pediatric_cardiology", displayName: "Pediatric Cardiology" },
  { name: "pediatric_neurology", displayName: "Pediatric Neurology" },
  { name: "pediatric_endocrinology", displayName: "Pediatric Endocrinology" },
  { name: "pediatric_nephrology", displayName: "Pediatric Nephrology" },
  { name: "pediatric_oncology", displayName: "Pediatric Oncology" },
  { name: "pediatric_gastroenterology", displayName: "Pediatric Gastroenterology" },
  { name: "pulmonary_critical_care", displayName: "Pulmonary Critical Care" },
  { name: "cardiothoracic_surgery", displayName: "Cardiothoracic Surgery" },
  { name: "chiropractic_medicine", displayName: "Chiropractic Medicine" },
  { name: "speech_language_therapy", displayName: "Speech & Language Therapy" },
  { name: "physiotherapy", displayName: "Physiotherapy" },
];

const getFilenameFromActiveStorageUrl = (url: string): string => {
  if (!url) return "Existing document";
  const path = url.split("?")[0];
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return last || "Existing document";
};

const step1Schema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNo: Yup.string()
    .required("Phone number is required")
    .matches(/^\(\d{3}\)\s\d{3}-\d{4}$/, "Phone number must be in format (000) 000-0000"),
  npiNumber: Yup.string().required("NPI number is required"),
  specialty: Yup.string().required("Specialty is required"),
});

const MAX_LICENSE_FILE_SIZE_MB = 10;
const MAX_LICENSE_FILE_SIZE_BYTES = MAX_LICENSE_FILE_SIZE_MB * 1024 * 1024;

const deaFirstLicenseSchema = Yup.object().shape({
  deaLicenseNumber: Yup.string().required("DEA License number is required"),
  deaLicenseState: Yup.string().required("DEA License state is required"),
  deaLicenseExpirationDate: Yup.string()
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
});

const Page = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deaErrors, setDeaErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNo: "",
    clinic: "",
    specialty: "",
    npiNumber: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [hasDeaLicense, setHasDeaLicense] = useState<"Yes" | "No">("No");
  const [deaLicenseNumber, setDeaLicenseNumber] = useState("");
  const [deaLicenseState, setDeaLicenseState] = useState("");
  const [deaLicenseExpirationDate, setDeaLicenseExpirationDate] = useState("");
  const [deaLicenseDocument, setDeaLicenseDocument] = useState<File | null>(null);
  const [deaLicenseEntries, setDeaLicenseEntries] = useState<
    Array<{ id?: string | number; licenseUrl?: string | null; deaLicenseNumber: string; deaLicenseState: string; deaLicenseExpirationDate: string; deaLicenseDocument: File | null; delete?: boolean }>
  >([]);
  const [firstDeaLicenseId, setFirstDeaLicenseId] = useState<string | number | null>(null);
  const [firstDeaLicenseUrl, setFirstDeaLicenseUrl] = useState<string | null>(null);
  const deaLicenseFileInputRef = useRef<HTMLInputElement>(null);
  const deaLicenseEntryFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isProfileCompleteFinish = useRef(false);

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

  const formatDeaDate = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 8);
    if (limited.length === 0) return "";
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)}-${limited.slice(2)}`;
    return `${limited.slice(0, 2)}-${limited.slice(2, 4)}-${limited.slice(4)}`;
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, "").slice(0, 10);
    if (numbers.length === 0) return "";
    if (numbers.length <= 3) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  };

  // Consume first-login flag so we don't redirect them to profile-complete again (only on first login from link)
  useEffect(() => {
    if (user?.id && user?.userType?.toLowerCase() === "doctor") {
      Cookies.remove("show_profile_complete");
    }
  }, [user?.id, user?.userType]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.id) return;
    if (user.userType?.toLowerCase() !== "doctor") {
      router.replace("/login");
      return;
    }
    const nameParts = (user?.fullName || "").split(" ");
    const firstName = user?.firstName || nameParts[0] || "";
    const lastName = user?.lastName || nameParts.slice(1).join(" ") || "";
    setFormData({
      firstName,
      lastName: lastName || "",
      email: user?.email ?? "",
      phoneNo: user?.phoneNo ?? "",
      clinic: user?.clinic ?? "",
      specialty: user?.specialty ?? "",
      npiNumber: user?.npiNumber ?? "",
      street1: user?.street1 ?? "",
      street2: user?.street2 ?? "",
      city: user?.city ?? "",
      state: user?.state ?? "",
      postalCode: user?.postalCode ?? "",
    });
    setSpecialtySearchTerm("");
    const licenses = user?.deaLicenses ?? [];
    const first = licenses[0];
    const hasDea = licenses.length > 0;
    setHasDeaLicense(hasDea ? "Yes" : "No");
    setDeaLicenseNumber(first?.deaLicense ?? "");
    setDeaLicenseState(first?.state ?? "");
    setDeaLicenseExpirationDate(toFormExpirationDate(first?.expirationDate));
    setFirstDeaLicenseId(first?.id ?? null);
    setFirstDeaLicenseUrl(first?.licenseUrl ?? null);
    setDeaLicenseEntries(
      licenses.slice(1).map((d) => ({
        id: d.id,
        licenseUrl: d.licenseUrl,
        deaLicenseNumber: d.deaLicense ?? "",
        deaLicenseState: d.state ?? "",
        deaLicenseExpirationDate: toFormExpirationDate(d.expirationDate),
        deaLicenseDocument: null,
      }))
    );
  }, [user?.id, user?.userType, user?.fullName, user?.firstName, user?.lastName, user?.email, user?.phoneNo, user?.clinic, user?.specialty, user?.npiNumber, user?.street1, user?.street2, user?.city, user?.state, user?.postalCode, user?.deaLicenses, router]);

  const [updateDoctor, { loading: updateLoading }] = useMutation(UPDATE_DOCTOR, {
    onCompleted: (data) => {
      const updatedUser = data?.updateUser?.user;
      if (updatedUser) {
        dispatch(setUser(updatedUser));
        Cookies.set("user_data", JSON.stringify(updatedUser), { expires: 7 });
      }
      if (!isProfileCompleteFinish.current) showSuccessToast("Profile updated successfully");
      isProfileCompleteFinish.current = false;
    },
    onError: (error) => {
      showErrorToast(error.message);
    },
  });

  const handleChange = (field: string, value: string) => {
    if (field === "phoneNo") value = formatPhoneNumber(value);
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const handleGroupSelect = (val: string | string[]) => {
    const selected = Array.isArray(val) ? val[0] : val;
    setFormData((prev) => ({ ...prev, specialty: selected || "" }));
    if (errors.specialty) setErrors((prev) => { const next = { ...prev }; delete next.specialty; return next; });
  };

  const addDeaLicenseEntry = () => {
    setDeaLicenseEntries((prev) => [...prev, { deaLicenseNumber: "", deaLicenseState: "", deaLicenseExpirationDate: "", deaLicenseDocument: null }]);
  };

  const updateDeaLicenseEntry = (index: number, field: "deaLicenseNumber" | "deaLicenseState" | "deaLicenseExpirationDate" | "deaLicenseDocument" | "licenseUrl", value: string | File | null) => {
    setDeaLicenseEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    const key = `deaLicenseEntries.${index}.${field}`;
    if (deaErrors[key]) setDeaErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const removeDeaLicenseEntry = (index: number) => {
    setDeaLicenseEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], delete: true };
      return next;
    });
  };

  const validateStep1 = async (): Promise<boolean> => {
    try {
      await step1Schema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err: unknown) {
      const yupErr = err as { inner?: Array<{ path?: string; message?: string }> };
      const next: Record<string, string> = {};
      (yupErr.inner ?? []).forEach((e) => { if (e.path) next[e.path] = e.message ?? ""; });
      setErrors(next);
      return false;
    }
  };

  const validateDeaDate = (value: string): string | null => {
    if (!value) return "DEA License expiration date is required";
    if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) return "Date must be in format MM-DD-YYYY (e.g., 01-15-1990)";
    const [month, day, year] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (!(date instanceof Date && !isNaN(date.getTime()) && date.getMonth() === month - 1 && date.getDate() === day && date.getFullYear() === year)) return "Please enter a valid date";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (date <= today) return "Expiration date must be in the future";
    return null;
  };

  const DEA_LICENSE_ACCEPT = ".pdf,application/pdf,image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";
  const validateLicenseFile = (file: File | null): string | null => {
    if (!file) return null;
    const isPdf = file.type === "application/pdf" || (file.name?.toLowerCase().endsWith(".pdf") ?? false);
    const isImage = /^image\/(jpeg|png|gif|webp)$/.test(file.type) || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name ?? "");
    if (!isPdf && !isImage) return "License document must be a PDF or image file (JPEG, PNG, WebP)";
    if (file.size > MAX_LICENSE_FILE_SIZE_BYTES) return `File size must be under ${MAX_LICENSE_FILE_SIZE_MB}MB`;
    return null;
  };

  const validateDea = (): { valid: boolean; errors: Record<string, string> } => {
    const errs: Record<string, string> = {};
    if (hasDeaLicense !== "Yes") return { valid: true, errors: {} };
    try {
      deaFirstLicenseSchema.validateSync({ deaLicenseNumber, deaLicenseState, deaLicenseExpirationDate }, { abortEarly: false });
    } catch (err: unknown) {
      const yupErr = err as { inner?: Array<{ path?: string; message?: string }> };
      (yupErr.inner ?? []).forEach((e) => { if (e.path) errs[e.path] = e.message ?? ""; });
    }
    if (!deaLicenseDocument && !firstDeaLicenseUrl) errs.deaLicenseDocument = "License document is required";
    else if (deaLicenseDocument) {
      const fileErr = validateLicenseFile(deaLicenseDocument);
      if (fileErr) errs.deaLicenseDocument = fileErr;
    }
    deaLicenseEntries.forEach((entry, index) => {
      if (entry.delete) return;
      if (!entry.deaLicenseNumber.trim()) errs[`deaLicenseEntries.${index}.deaLicenseNumber`] = "DEA License number is required";
      if (!entry.deaLicenseState) errs[`deaLicenseEntries.${index}.deaLicenseState`] = "DEA License state is required";
      const dateErr = validateDeaDate(entry.deaLicenseExpirationDate);
      if (dateErr) errs[`deaLicenseEntries.${index}.deaLicenseExpirationDate`] = dateErr;
      if (!entry.deaLicenseDocument && !entry.licenseUrl) errs[`deaLicenseEntries.${index}.deaLicenseDocument`] = "License document is required";
      else if (entry.deaLicenseDocument) {
        const fileErr = validateLicenseFile(entry.deaLicenseDocument);
        if (fileErr) errs[`deaLicenseEntries.${index}.deaLicenseDocument`] = fileErr;
      }
    });
    return { valid: Object.keys(errs).length === 0, errors: errs };
  };

  const buildVariables = (overrides: Record<string, unknown> = {}) => {
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    return {
      fullName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNo: formData.phoneNo || null,
      npiNumber: formData.npiNumber || null,
      specialty: formData.specialty || null,
      clinic: formData.clinic || null,
      street1: formData.street1 || null,
      street2: formData.street2 || null,
      city: formData.city || null,
      state: formData.state || null,
      postalCode: formData.postalCode || null,
      address: formData.street1 ? `${formData.street1}${formData.street2 ? `, ${formData.street2}` : ""}, ${formData.city}, ${formData.state} ${formData.postalCode}` : null,
      ...(selectedImage && { image: selectedImage }),
      ...overrides,
    };
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const valid = await validateStep1();
      if (!valid) return;
      try {
        await updateDoctor({ variables: buildVariables() });
        setCurrentStep(2);
      } catch {
        // Error handled in mutation
      }
      return;
    }
    if (currentStep === 2) {
      try {
        await updateDoctor({ variables: buildVariables() });
        setCurrentStep(3);
      } catch {
        // Error handled in mutation
      }
      return;
    }
    if (currentStep === 3) {
      const { valid, errors: deaErr } = validateDea();
      if (!valid) {
        setDeaErrors(deaErr);
        const firstKey = Object.keys(deaErr)[0];
        setTimeout(() => document.getElementById(firstKey === "deaLicenseDocument" ? "deaLicenseDocument" : firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
        return;
      }
      setDeaErrors({});
      const toExpiration = (mmddyyyy: string) => {
        if (!mmddyyyy) return "";
        const [mm, dd, yyyy] = mmddyyyy.split("-");
        return yyyy && mm && dd ? `${yyyy}-${mm}-${dd}` : mmddyyyy;
      };
      type LicensePayload = { id?: string | number; deaLicense?: string; state?: string; expirationDate?: string; license?: File; delete?: boolean };
      const licenses: LicensePayload[] = [];
      if (hasDeaLicense === "Yes") {
        if (deaLicenseDocument || firstDeaLicenseUrl) {
          const first: LicensePayload = { deaLicense: deaLicenseNumber, state: deaLicenseState, expirationDate: toExpiration(deaLicenseExpirationDate) };
          if (firstDeaLicenseId != null) first.id = firstDeaLicenseId;
          if (deaLicenseDocument) first.license = deaLicenseDocument;
          licenses.push(first);
        }
        deaLicenseEntries.forEach((entry) => {
          if (entry.delete) return;
          if (entry.deaLicenseDocument || entry.licenseUrl) {
            const L: LicensePayload = { deaLicense: entry.deaLicenseNumber, state: entry.deaLicenseState, expirationDate: toExpiration(entry.deaLicenseExpirationDate) };
            if (entry.id != null) L.id = entry.id;
            if (entry.deaLicenseDocument) L.license = entry.deaLicenseDocument;
            licenses.push(L);
          }
        });
      } else if (user && (user.deaLicenses?.length ?? 0) > 0) {
        (user.deaLicenses ?? []).forEach((d) => {
          licenses.push({ id: d.id, deaLicense: d.deaLicense ?? "", state: d.state ?? "", expirationDate: d.expirationDate ?? "", delete: true });
        });
      }
      try {
        isProfileCompleteFinish.current = true;
        const variables = buildVariables({ deaLicensesAttributes: licenses.length > 0 ? licenses : undefined });
        await updateDoctor({ variables });
        showSuccessToast("Profile complete! Redirecting to My Store.");
        window.location.href = "/my-store";
      } catch {
        isProfileCompleteFinish.current = false;
        // Error handled in mutation
      }
    }
  };

  if (!user?.id) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen">
        <AuthHeader logo={Images.auth.logo} title="" />
        <Loader />
      </div>
    );
  }

  if (user?.userType?.toLowerCase() !== "doctor") {
    return null;
  }

  return (
    <div className="relative flex flex-col h-screen overflow-hidden pt-23">
      <AuthHeader logo={Images.auth.logo} title="" />
      <div className="flex-1 min-h-0 w-full overflow-y-auto flex flex-col items-center">
        <div className="w-full flex flex-col items-center justify-center space-y-3 py-4 pb-10 max-w-md md:max-w-2xl">
        <div className="block w-full max-w-md">
          <ProfileStepper activeStep={currentStep} steps={steps} />
        </div>
        {currentStep === 1 && (
          <div className="flex flex-col gap-4 w-full max-w-md">
            <span className="block -mb-2 text-sm text-gray-700 font-medium text-start">Your profile photo</span>
            <ImageUpload
              imageUrl={user?.imageUrl ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${user.imageUrl}` : undefined}
              onChange={setSelectedImage}
              placeholder="/images/arinaProfile.png"
              showTitle={false}
              roundedClass="rounded-lg"
              width={isMobile ? 72 : 120}
              height={isMobile ? 72 : 120}
              className="border-b-0"
              showUpdateBtn={false}
            />
            <div className="grid grid-cols-1 gap-4">
              <ThemeInput required label="First Name" placeholder="Enter first name" value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} type="text" error={!!errors.firstName} errorMessage={errors.firstName} id="firstName" />
              <ThemeInput required label="Last Name" placeholder="Enter last name" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} type="text" error={!!errors.lastName} errorMessage={errors.lastName} id="lastName" />
              <ThemeInput required label="Email" placeholder="Enter email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} error={!!errors.email} errorMessage={errors.email} id="email" />
              <ThemeInput required label="Phone Number" placeholder="(000) 000-0000" value={formData.phoneNo} onChange={(e) => handleChange("phoneNo", e.target.value)} type="tel" error={!!errors.phoneNo} errorMessage={errors.phoneNo} id="phoneNo" className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              <ThemeInput label="Clinic" placeholder="Enter clinic name" value={formData.clinic} onChange={(e) => handleChange("clinic", e.target.value)} type="text" id="clinic" />
              <SelectGroupDropdown selectedGroup={formData.specialty} setSelectedGroup={handleGroupSelect} groups={specialities} name="Specialty" multiple={false} placeholder="Select specialty" searchTerm={specialtySearchTerm} setSearchTerm={setSpecialtySearchTerm} isShowDrop={true} required paddingClasses="py-2.5 px-3" optionPaddingClasses="p-1" showLabel={true} />
              {errors.specialty && <p className="text-red-500 text-xs mt-1">{errors.specialty}</p>}
              <ThemeInput required label="NPI number" placeholder="Enter NPI number" value={formData.npiNumber} onChange={(e) => handleChange("npiNumber", e.target.value)} type="text" error={!!errors.npiNumber} errorMessage={errors.npiNumber} id="npiNumber" />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col gap-4 w-full max-w-md">
            <div className="grid grid-cols-1 gap-4">
              <GoogleAutocompleteInput label="Street Address" placeholder="Enter street address" value={formData.street1} onChange={(value) => handleChange("street1", value)} onAddressSelect={(address) => setFormData((prev) => ({ ...prev, street1: address.street1, city: address.city, state: address.state, postalCode: address.postalCode }))} id="street1" />
              <ThemeInput label="Street Address 2 (Optional)" placeholder="Apartment, suite, etc. (optional)" value={formData.street2} onChange={(e) => handleChange("street2", e.target.value)} type="text" id="street2" />
              <ThemeInput label="City" placeholder="Enter city" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} type="text" id="city" />
              <ThemeInput label="State" placeholder="Enter state" value={formData.state} onChange={(e) => handleChange("state", e.target.value)} type="text" id="state" />
              <ThemeInput label="Postal Code" placeholder="Enter postal code" value={formData.postalCode} onChange={(e) => handleChange("postalCode", e.target.value)} type="text" id="postalCode" />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="w-full max-w-md md:max-w-2xl space-y-4">
            <div className="flex items-center gap-6">
              <label className="text-sm font-medium text-gray-700">Do you have DEA Licenses?</label>
              <label className="flex items-center gap-2">
                <input type="radio" value="Yes" name="hasDeaLicense" checked={hasDeaLicense === "Yes"} onChange={() => setHasDeaLicense("Yes")} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="No" name="hasDeaLicense" checked={hasDeaLicense === "No"} onChange={() => setHasDeaLicense("No")} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                No
              </label>
            </div>

            {hasDeaLicense === "Yes" && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="w-full" id="deaLicenseNumber">
                    <ThemeInput label="DEA License" placeholder="Enter DEA License number" value={deaLicenseNumber} onChange={(e) => { setDeaLicenseNumber(e.target.value); if (deaErrors.deaLicenseNumber) setDeaErrors((p) => { const n = { ...p }; delete n.deaLicenseNumber; return n; }); }} type="text" error={!!deaErrors.deaLicenseNumber} errorMessage={deaErrors.deaLicenseNumber} />
                  </div>
                  <div className="w-full" id="deaLicenseState">
                    <Dropdown label="State" placeholder="Select state" options={US_STATES} value={deaLicenseState} onChange={(value) => { setDeaLicenseState(value); if (deaErrors.deaLicenseState) setDeaErrors((p) => { const n = { ...p }; delete n.deaLicenseState; return n; }); }} showSearch searchPlaceholder="Search states..." error={!!deaErrors.deaLicenseState} errorMessage={deaErrors.deaLicenseState} />
                  </div>
                  <div className="w-full" id="deaLicenseExpirationDate">
                    <ThemeInput label="DEA License Expiration" type="text" value={deaLicenseExpirationDate} onChange={(e) => { setDeaLicenseExpirationDate(formatDeaDate(e.target.value)); if (deaErrors.deaLicenseExpirationDate) setDeaErrors((p) => { const n = { ...p }; delete n.deaLicenseExpirationDate; return n; }); }} placeholder="MM-DD-YYYY (e.g., 01-15-2026)" maxLength={10} error={!!deaErrors.deaLicenseExpirationDate} errorMessage={deaErrors.deaLicenseExpirationDate} />
                  </div>
                </div>
                <div id="deaLicenseDocument">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Upload License Document <span className="text-red-600">*</span></label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
                      <button type="button" onClick={() => deaLicenseFileInputRef.current?.click()} className="px-4 py-2.5 text-sm font-medium text-gray-700 border-r border-gray-200 hover:bg-gray-50">Choose file</button>
                      <span className="flex-1 px-4 py-2.5 text-sm text-gray-900 truncate">{deaLicenseDocument?.name || (firstDeaLicenseUrl ? getFilenameFromActiveStorageUrl(firstDeaLicenseUrl) : "No file chosen")}</span>
                      {deaLicenseDocument && <button type="button" onClick={() => { setDeaLicenseDocument(null); if (deaLicenseFileInputRef.current) deaLicenseFileInputRef.current.value = ""; }} className="p-2.5 text-gray-500 hover:text-gray-700"><CrossIcon width="18" height="18" fill="currentColor" /></button>}
                    </div>
                    {firstDeaLicenseUrl && (
                      <div className="flex items-center gap-2">
                        <a href={`${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${firstDeaLicenseUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:underline rounded-md border border-primary/30 bg-primary/5"><EyeIcon /> Preview</a>
                      </div>
                    )}
                  </div>
                    <input ref={deaLicenseFileInputRef} type="file" className="hidden" accept={DEA_LICENSE_ACCEPT} onChange={(e) => { const file = e.target.files?.[0] ?? null; setDeaLicenseDocument(file); const err = file ? validateLicenseFile(file) : null; if (err) setDeaErrors((p) => ({ ...p, deaLicenseDocument: err })); else if (deaErrors.deaLicenseDocument) setDeaErrors((p) => { const n = { ...p }; delete n.deaLicenseDocument; return n; }); }} />
                  {deaErrors.deaLicenseDocument && <p className="mt-1.5 text-sm font-medium text-red-600" role="alert">{deaErrors.deaLicenseDocument}</p>}
                </div>
                {deaLicenseEntries.map((entry, index) => {
                  if (entry.delete) return null;
                  const entryError = (f: string) => deaErrors[`deaLicenseEntries.${index}.${f}`];
                  return (
                    <div key={entry.id ?? index} className="space-y-3 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <ThemeInput label="DEA License" placeholder="Enter DEA License number" value={entry.deaLicenseNumber} onChange={(e) => updateDeaLicenseEntry(index, "deaLicenseNumber", e.target.value)} type="text" error={!!entryError("deaLicenseNumber")} errorMessage={entryError("deaLicenseNumber")} />
                        <Dropdown label="State" placeholder="Select state" options={US_STATES} value={entry.deaLicenseState} onChange={(value) => updateDeaLicenseEntry(index, "deaLicenseState", value)} showSearch searchPlaceholder="Search states..." error={!!entryError("deaLicenseState")} errorMessage={entryError("deaLicenseState")} />
                        <ThemeInput label="DEA License Expiration" type="text" value={entry.deaLicenseExpirationDate} onChange={(e) => updateDeaLicenseEntry(index, "deaLicenseExpirationDate", formatDeaDate(e.target.value))} placeholder="MM-DD-YYYY" maxLength={10} error={!!entryError("deaLicenseExpirationDate")} errorMessage={entryError("deaLicenseExpirationDate")} />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Upload License Document <span className="text-red-600">*</span></label>
                        <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
                          <button type="button" onClick={() => deaLicenseEntryFileRefs.current[index]?.click()} className="px-4 py-2.5 text-sm font-medium text-gray-700 border-r border-gray-200 hover:bg-gray-50">Choose file</button>
                          <span className="flex-1 px-4 py-2.5 text-sm text-gray-900 truncate">{entry.deaLicenseDocument?.name || (entry.licenseUrl ? getFilenameFromActiveStorageUrl(entry.licenseUrl) : "No file chosen")}</span>
                          {entry.deaLicenseDocument && <button type="button" onClick={() => { updateDeaLicenseEntry(index, "deaLicenseDocument", null); const input = deaLicenseEntryFileRefs.current[index]; if (input) input.value = ""; }} className="p-2.5 text-gray-500 hover:text-gray-700"><CrossIcon width="18" height="18" fill="currentColor" /></button>}
                        </div>
                        <input ref={(el) => { deaLicenseEntryFileRefs.current[index] = el; }} type="file" className="hidden" accept={DEA_LICENSE_ACCEPT} onChange={(e) => { const file = e.target.files?.[0] ?? null; updateDeaLicenseEntry(index, "deaLicenseDocument", file); const err = file ? validateLicenseFile(file) : null; const key = `deaLicenseEntries.${index}.deaLicenseDocument`; if (err) setDeaErrors((p) => ({ ...p, [key]: err })); else setDeaErrors((p) => { const n = { ...p }; delete n[key]; return n; }); }} />
                        {entryError("deaLicenseDocument") && <p className="mt-1.5 text-sm font-medium text-red-600" role="alert">{entryError("deaLicenseDocument")}</p>}
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={() => removeDeaLicenseEntry(index)} className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"><TrashBinIcon width="12" height="12" fill="currentColor" /> Remove</button>
                      </div>
                    </div>
                  );
                })}
                <button type="button" onClick={addDeaLicenseEntry} className="mt-2 flex items-center gap-2 text-primary font-medium hover:underline"><PlusIcon width="20" height="20" /> Add New</button>
              </div>
            )}
          </div>
        )}

        <div className={`flex items-center w-full gap-4 mt-5 max-w-md ${currentStep === 3 ? "md:max-w-2xl" : ""}`}>
          {currentStep !== 1 && (
            <div className="w-full">
              <ThemeButton label="Back" onClick={() => setCurrentStep((s) => s - 1)} variant="outline" minWidthClass="w-full" disabled={updateLoading} />
            </div>
          )}
          <div className="w-full">
            <ThemeButton onClick={handleNext} label={currentStep === 3 ? "Finish" : "Next"} minWidthClass="w-full" disabled={updateLoading} />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
