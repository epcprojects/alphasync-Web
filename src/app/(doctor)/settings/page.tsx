"use client";
import {
  ChangePassword,
  NotificationToggle,
  ThemeButton,
  ThemeInput,
  ImageUpload,
  GoogleAutocompleteInput,
  Dropdown,
} from "@/app/components";
import SelectGroupDropdown from "@/app/components/ui/dropdowns/selectgroupDropdown";
import {
  AlertIcon,
  CrossIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
  MessageSquareIcon,
  PackageOutlineIcon,
  PlusIcon,
  ReminderIcon,
  SecurityLock,
  TrashBinIcon,
  UserIcon,
} from "@/icons";
import {
  Switch,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import React, { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { Formik, Form, ErrorMessage } from "formik";
import { useMutation, useQuery } from "@apollo/client";
import Cookies from "js-cookie";
import { useIsMobile } from "@/hooks/useIsMobile";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import {
  UPDATE_DOCTOR,
  REMOVE_IMAGE,
  EMAIL_NOTIFICATION_SETTINGS,
  SMS_NOTIFICATION_SETTINGS,
  ORDER_UPDATES_NOTIFICATION_SETTINGS,
  LOW_STOCK_ALERTS_NOTIFICATION_SETTINGS,
  DISABLE_2FA,
} from "@/lib/graphql/mutations";
import { FETCH_NOTIFICATION_SETTINGS } from "@/lib/graphql/queries";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";
import { US_STATES } from "@/lib/constants";

/** Extract filename from Rails Active Storage URL */
const getFilenameFromActiveStorageUrl = (url: string): string => {
  if (!url) return "Existing document";
  const path = url.split("?")[0];
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return last || "Existing document";
};

const Page = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isTwoFaEnabled, setIsTwoFaEnabled] = useState(!!user?.twoFaEnabled);
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState("");
  const [toggles, setToggles] = useState({
    email: true,
    sms: false,
    orders: true,
    stock: true,
  });

  // DEA license state (synced from user, updated on save)
  const [hasDeaLicense, setHasDeaLicense] = useState<"Yes" | "No">("No");
  const [deaLicenseNumber, setDeaLicenseNumber] = useState("");
  const [deaLicenseState, setDeaLicenseState] = useState("");
  const [deaLicenseExpirationDate, setDeaLicenseExpirationDate] = useState("");
  const [deaLicenseDocument, setDeaLicenseDocument] = useState<File | null>(null);
  const deaLicenseFileInputRef = useRef<HTMLInputElement>(null);
  const [deaLicenseEntries, setDeaLicenseEntries] = useState<
    Array<{
      id?: string | number;
      licenseUrl?: string | null;
      deaLicenseNumber: string;
      deaLicenseState: string;
      deaLicenseExpirationDate: string;
      deaLicenseDocument: File | null;
      delete?: boolean;
    }>
  >([]);
  const [firstDeaLicenseId, setFirstDeaLicenseId] = useState<string | number | null>(null);
  const [firstDeaLicenseUrl, setFirstDeaLicenseUrl] = useState<string | null>(null);
  const [deletedLicenses, setDeletedLicenses] = useState<Array<{ id: string | number; deaLicense: string; state: string; expirationDate: string }>>([]);
  const deaLicenseEntryFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [deaErrors, setDeaErrors] = useState<Record<string, string>>({});

  const isMobile = useIsMobile();

  // DEA validation schema (same rules as AddEditDoctorModal)
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
        return (
          date instanceof Date &&
          !isNaN(date.getTime()) &&
          date.getMonth() === month - 1 &&
          date.getDate() === day &&
          date.getFullYear() === year
        );
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

  useEffect(() => {
    setIsTwoFaEnabled(!!user?.twoFaEnabled);
  }, [user?.twoFaEnabled]);

  useEffect(() => {
    setSpecialtySearchTerm("");
  }, [user?.specialty]);

  useEffect(() => {
    const licenses = user?.deaLicenses ?? [];
    const first = licenses[0];
    const hasDea = licenses.length > 0;
    setHasDeaLicense(hasDea ? "Yes" : "No");
    setDeaLicenseNumber(first?.deaLicense ?? "");
    setDeaLicenseState(first?.state ?? "");
    setDeaLicenseExpirationDate(toFormExpirationDate(first?.expirationDate));
    setDeaLicenseDocument(null);
    setFirstDeaLicenseId(first?.id ?? null);
    setFirstDeaLicenseUrl(first?.licenseUrl ?? null);
    setDeletedLicenses([]);
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
  }, [user?.deaLicenses]);

  const addDeaLicenseEntry = () => {
    setDeaLicenseEntries((prev) => [
      ...prev,
      { deaLicenseNumber: "", deaLicenseState: "", deaLicenseExpirationDate: "", deaLicenseDocument: null },
    ]);
  };

  const updateDeaLicenseEntry = (
    index: number,
    field: "deaLicenseNumber" | "deaLicenseState" | "deaLicenseExpirationDate" | "deaLicenseDocument" | "licenseUrl",
    value: string | File | null
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
        { id: firstDeaLicenseId, deaLicense: deaLicenseNumber, state: deaLicenseState, expirationDate: toExp(deaLicenseExpirationDate) },
      ]);
    }
    const firstNonDeletedIndex = deaLicenseEntries.findIndex((e) => !e.delete);
    if (firstNonDeletedIndex === -1) return;
    const first = deaLicenseEntries[firstNonDeletedIndex];
    setFirstDeaLicenseId(first.id ?? null);
    setFirstDeaLicenseUrl(first.licenseUrl ?? null);
    setDeaLicenseNumber(first.deaLicenseNumber);
    setDeaLicenseState(first.deaLicenseState);
    setDeaLicenseExpirationDate(first.deaLicenseExpirationDate);
    setDeaLicenseDocument(first.deaLicenseDocument);
    setDeaLicenseEntries((prev) => prev.filter((_, i) => i !== firstNonDeletedIndex));
    if (deaLicenseFileInputRef.current) deaLicenseFileInputRef.current.value = "";
  };

  // Fetch notification settings
  const {
    loading: notificationLoading,
    data: notificationData,
    error: notificationError,
  } = useQuery(FETCH_NOTIFICATION_SETTINGS);

  useEffect(() => {
    if (notificationData?.notificationSettings) {
      const settings = notificationData.notificationSettings;
      setToggles({
        email: settings.emailNotification ?? true,
        sms: settings.smsNotification ?? false,
        orders: settings.orderUpdates ?? true,
        stock: settings.lowStockAlerts ?? true,
      });
    }
  }, [notificationData]);

  useEffect(() => {
    if (notificationError) {
      console.error("Error fetching notification settings:", notificationError);
    }
  }, [notificationError]);

  // Mutation hooks for each notification type
  const [updateEmailNotification] = useMutation(EMAIL_NOTIFICATION_SETTINGS, {
    onCompleted: () => {
      showSuccessToast("Email notification settings updated");
    },
    onError: (error) => {
      showErrorToast(error.message || "Failed to update email notification");
    },
  });

  const [updateSmsNotification] = useMutation(SMS_NOTIFICATION_SETTINGS, {
    onCompleted: () => {
      showSuccessToast("SMS notification settings updated");
    },
    onError: (error) => {
      showErrorToast(error.message || "Failed to update SMS notification");
    },
  });

  const [updateOrderUpdates] = useMutation(
    ORDER_UPDATES_NOTIFICATION_SETTINGS,
    {
      onCompleted: () => {
        showSuccessToast("Order updates notification settings updated");
      },
      onError: (error) => {
        showErrorToast(
          error.message || "Failed to update order updates notification",
        );
      },
    },
  );

  const [updateLowStockAlerts] = useMutation(
    LOW_STOCK_ALERTS_NOTIFICATION_SETTINGS,
    {
      onCompleted: () => {
        showSuccessToast("Low stock alerts notification settings updated");
      },
      onError: (error) => {
        showErrorToast(
          error.message || "Failed to update low stock alerts notification",
        );
      },
    },
  );

  // Handler for toggle changes
  const handleToggleChange = async (key: string, value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));

    try {
      switch (key) {
        case "email":
          await updateEmailNotification({
            variables: { emailNotification: value },
          });
          break;
        case "sms":
          await updateSmsNotification({
            variables: { smsNotification: value },
          });
          break;
        case "orders":
          await updateOrderUpdates({
            variables: { orderUpdates: value },
          });
          break;
        case "stock":
          await updateLowStockAlerts({
            variables: { lowStockAlerts: value },
          });
          break;
      }
    } catch (error) {
      // Revert toggle on error
      setToggles((prev) => ({ ...prev, [key]: !value }));
      console.error("Error updating notification setting:", error);
    }
  };

  const [updateDoctor, { loading: updateLoading }] = useMutation(
    UPDATE_DOCTOR,
    {
      onCompleted: (data) => {
        if (data?.updateUser?.user) {
          dispatch(setUser(data.updateUser.user));
          Cookies.set("user_data", JSON.stringify(data?.updateUser?.user), {
            expires: 7,
          });
          showSuccessToast("Profile updated successfully!");
        }
      },
      onError: (error) => {
        showErrorToast(error.message || "Failed to update profile");
      },
    },
  );

  const [removeImage] = useMutation(REMOVE_IMAGE, {
    onCompleted: (data) => {
      if (data?.removeImage?.user) {
        dispatch(setUser(data.removeImage.user));
        Cookies.set("user_data", JSON.stringify(data.removeImage.user), {
          expires: 7,
        });
        showSuccessToast("Image removed successfully!");
      }
    },
    onError: (error) => {
      showErrorToast(error.message || "Failed to remove image");
    },
  });

  const INITIAL_AVATAR = "/images/arinaProfile.png";

  const [toggleTwoFactor, { loading: twoFaUpdating }] =
    useMutation(DISABLE_2FA);

  const handleImageRemove = async () => {
    try {
      await removeImage({
        variables: {
          id: user?.id,
          removeImage: true,
        },
      });
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  const handleTwoFaToggle = async (value: boolean) => {
    const previousValue = isTwoFaEnabled;
    setIsTwoFaEnabled(value);

    try {
      const { data } = await toggleTwoFactor({
        variables: {
          twoFaEnabled: value,
        },
      });

      if (data?.updateUser?.user) {
        dispatch(setUser(data.updateUser.user));
        Cookies.set("user_data", JSON.stringify(data.updateUser.user), {
          expires: 7,
        });
      }

      showSuccessToast(
        value
          ? "Two-factor authentication enabled"
          : "Two-factor authentication disabled",
      );
    } catch (error) {
      setIsTwoFaEnabled(previousValue);
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Failed to update two-factor authentication",
      );
    }
  };

  const notifications = [
    {
      key: "email",
      icon: <MailIcon height={isMobile ? 18 : 24} width={isMobile ? 18 : 24} />,
      title: "Email Notifications",
      subtitle: "Receive notifications via email",
    },
    {
      key: "sms",
      icon: (
        <MessageSquareIcon
          height={isMobile ? 18 : 24}
          width={isMobile ? 18 : 24}
        />
      ),
      title: "SMS Notifications",
      subtitle: "Receive urgent notifications via SMS",
    },
    {
      key: "orders",
      icon: (
        <PackageOutlineIcon
          fill="#6B7280"
          height={isMobile ? "18" : "24"}
          width={isMobile ? "18" : "22"}
        />
      ),
      title: "Order Updates",
      subtitle: "Get notified about order status changes",
    },
    {
      key: "stock",
      icon: (
        <AlertIcon height={isMobile ? 18 : 24} width={isMobile ? 18 : 24} />
      ),
      title: "Low Stock Alerts",
      subtitle: "Get alerts when inventory is running low",
    },
  ];

  const profileSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phoneNo: Yup.string()
      .required("Phone number is required")
      .matches(
        /^\(\d{3}\)\s\d{3}-\d{4}$/,
        "Phone number must be in format (512) 312-3123",
      ),
    npiNumber: Yup.string().required("NPI number is required"),
    specialty: Yup.string().required("Specialty is required"),
    street1: Yup.string().required("Street address is required"),
    street2: Yup.string().optional(),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    postalCode: Yup.string().required("Postal code is required"),
    sameAsShippingAddress: Yup.boolean(),
    shippingStreet1: Yup.string().when("sameAsShippingAddress", {
      is: false,
      then: (schema) => schema.required("Shipping street address is required"),
      otherwise: (schema) => schema.optional(),
    }),
    shippingStreet2: Yup.string().optional(),
    shippingCity: Yup.string().when("sameAsShippingAddress", {
      is: false,
      then: (schema) => schema.required("Shipping city is required"),
      otherwise: (schema) => schema.optional(),
    }),
    shippingState: Yup.string().when("sameAsShippingAddress", {
      is: false,
      then: (schema) => schema.required("Shipping state is required"),
      otherwise: (schema) => schema.optional(),
    }),
    shippingPostalCode: Yup.string().when("sameAsShippingAddress", {
      is: false,
      then: (schema) => schema.required("Shipping postal code is required"),
      otherwise: (schema) => schema.optional(),
    }),
  });

  const validateDea = (): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    if (hasDeaLicense !== "Yes") return { valid: true, errors: {} };

    try {
      deaFirstLicenseSchema.validateSync(
        {
          deaLicenseNumber,
          deaLicenseState,
          deaLicenseExpirationDate,
        },
        { abortEarly: false }
      );
    } catch (err: unknown) {
      const yupErr = err as { inner?: Array<{ path?: string; message?: string }> };
      (yupErr.inner ?? []).forEach((e) => {
        if (e.path) errors[e.path] = e.message ?? "Invalid value";
      });
    }
    if (!deaLicenseDocument && !firstDeaLicenseUrl) {
      errors.deaLicenseDocument = "License document is required";
    }
    deaLicenseEntries.forEach((entry, index) => {
      if (entry.delete) return;
      if (!entry.deaLicenseNumber) errors[`deaLicenseEntries.${index}.deaLicenseNumber`] = "DEA License number is required";
      if (!entry.deaLicenseState) errors[`deaLicenseEntries.${index}.deaLicenseState`] = "DEA License state is required";
      if (!entry.deaLicenseExpirationDate) errors[`deaLicenseEntries.${index}.deaLicenseExpirationDate`] = "DEA License expiration date is required";
      if (!entry.deaLicenseDocument && !entry.licenseUrl) errors[`deaLicenseEntries.${index}.deaLicenseDocument`] = "License document is required";
    });
    return { valid: Object.keys(errors).length === 0, errors };
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
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="bg-white rounded-xl ">
        <div className=" ">
          <TabGroup>
            <TabList
              className={
                "flex items-center border-b border-b-gray-200 gap-1 md:gap-3 md:justify-start  justify-between md:px-6"
              }
            >
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 whitespace-nowrap text-sm md:text-base hover:bg-gray-50 outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-1.5 py-3 md:py-4 md:px-6"
                }
              >
                <UserIcon
                  fill="currentColor"
                  width={isMobile ? "16" : "20"}
                  height={isMobile ? "16" : "20"}
                />
                {isMobile ? "Profile" : "My Profile"}
              </Tab>
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 whitespace-nowrap outline-none text-sm md:text-base border-b-2 hover:bg-gray-50 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-1.5 py-3 md:py-4 md:px-6"
                }
              >
                <LockIcon
                  fill="currentColor"
                  width={isMobile ? "16" : "20"}
                  height={isMobile ? "16" : "20"}
                />
                {isMobile ? "Password" : "Change Password"}
              </Tab>
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 outline-none text-sm md:text-base border-b-2 hover:bg-gray-50 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-1.5 py-3 md:py-4 md:px-6"
                }
              >
                <ReminderIcon
                  fill="currentColor"
                  width={isMobile ? "16" : "20"}
                  height={isMobile ? "16" : "20"}
                />
                Notifications
              </Tab>
            </TabList>
            <TabPanels className={"pb-0 lg:p-6"}>
              <TabPanel className={"px-5 pb-4 lg:px-8"}>
                <ImageUpload
                  imageUrl={
                    user?.imageUrl
                      ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${user?.imageUrl}`
                      : undefined
                  }
                  onChange={setSelectedImage}
                  onImageRemove={handleImageRemove}
                  placeholder={INITIAL_AVATAR}
                  className="py-3 md:py-5 lg:gap-8"
                  showTitle={false}
                />
                <Formik
                  initialValues={{
                    firstName:
                      user?.firstName ||
                      (user?.fullName ? user.fullName.split(" ")[0] : "") ||
                      "",
                    lastName:
                      user?.lastName ||
                      (user?.fullName
                        ? user.fullName.split(" ").slice(1).join(" ")
                        : "") ||
                      "",
                    email: user?.email ?? "",
                    phoneNo: user?.phoneNo ?? "",
                    npiNumber: user?.npiNumber ?? "",
                    specialty: user?.specialty ?? "",
                    clinic: user?.clinic ?? "",
                    street1: user?.street1 ?? "",
                    street2: user?.street2 ?? "",
                    city: user?.city ?? "",
                    state: user?.state ?? "",
                    postalCode: user?.postalCode ?? "",
                    sameAsShippingAddress: user?.sameAsBillingAddress ?? true,
                    shippingStreet1: user?.shippingStreet1 ?? "",
                    shippingStreet2: user?.shippingStreet2 ?? "",
                    shippingCity: user?.shippingCity ?? "",
                    shippingState: user?.shippingState ?? "",
                    shippingPostalCode: user?.shippingPostalCode ?? "",
                  }}
                  validationSchema={profileSchema}
                  onSubmit={async (values) => {
                    const { valid: deaValid, errors: deaErr } = validateDea();
                    if (!deaValid) {
                      setDeaErrors(deaErr);
                      const firstKey = Object.keys(deaErr)[0];
                      const scrollId = firstKey === "deaLicenseDocument" ? "deaLicenseDocument" : firstKey;
                      setTimeout(() => {
                        document.getElementById(scrollId)?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 100);
                      return;
                    }
                    setDeaErrors({});
                    try {
                      const isSameAsShipping = values.sameAsShippingAddress;
                      const variables = {
                        fullName:
                          `${values.firstName} ${values.lastName}`.trim(),
                        firstName: values.firstName,
                        lastName: values.lastName,
                        email: values.email,
                        phoneNo: values.phoneNo,
                        npiNumber: values.npiNumber,
                        specialty: values.specialty,
                        clinic: values.clinic || null,
                        street1: values.street1 || null,
                        street2: values.street2 || null,
                        city: values.city || null,
                        state: values.state || null,
                        postalCode: values.postalCode || null,
                        address: values.street1
                          ? `${values.street1}${
                              values.street2 ? `, ${values.street2}` : ""
                            }, ${values.city}, ${values.state} ${
                              values.postalCode
                            }`
                          : null,
                        sameAsBillingAddress: isSameAsShipping,
                        shippingStreet1: isSameAsShipping
                          ? values.street1 || null
                          : values.shippingStreet1 || null,
                        shippingStreet2: isSameAsShipping
                          ? values.street2 || null
                          : values.shippingStreet2 || null,
                        shippingCity: isSameAsShipping
                          ? values.city || null
                          : values.shippingCity || null,
                        shippingState: isSameAsShipping
                          ? values.state || null
                          : values.shippingState || null,
                        shippingPostalCode: isSameAsShipping
                          ? values.postalCode || null
                          : values.shippingPostalCode || null,
                        ...(selectedImage && { image: selectedImage }),
                      };

                      const toExpiration = (mmddyyyy: string) => {
                        if (!mmddyyyy) return "";
                        const [mm, dd, yyyy] = mmddyyyy.split("-");
                        return yyyy && mm && dd ? `${yyyy}-${mm}-${dd}` : mmddyyyy;
                      };

                      if (hasDeaLicense === "Yes") {
                        type LicensePayload = {
                          id?: string | number;
                          deaLicense?: string;
                          state?: string;
                          expirationDate?: string;
                          license?: File;
                          delete?: boolean;
                        };
                        const existingLicenses = user?.deaLicenses ?? [];
                        const licenses: LicensePayload[] = [];
                        const firstExpirationFormatted = toExpiration(deaLicenseExpirationDate);
                        const firstKeep = !!(deaLicenseDocument || firstDeaLicenseUrl);
                        if (firstKeep) {
                          const firstLicense: LicensePayload = {
                            deaLicense: deaLicenseNumber,
                            state: deaLicenseState,
                            expirationDate: firstExpirationFormatted,
                          };
                          if (firstDeaLicenseId != null) firstLicense.id = firstDeaLicenseId;
                          if (deaLicenseDocument) firstLicense.license = deaLicenseDocument;
                          licenses.push(firstLicense);
                        } else if (firstDeaLicenseId != null) {
                          licenses.push({
                            id: firstDeaLicenseId,
                            deaLicense: deaLicenseNumber,
                            state: deaLicenseState,
                            expirationDate: firstExpirationFormatted,
                            delete: true,
                          });
                        }
                        deletedLicenses.forEach((d) => {
                          licenses.push({
                            id: d.id,
                            deaLicense: d.deaLicense,
                            state: d.state,
                            expirationDate: d.expirationDate,
                            delete: true,
                          });
                        });
                        deaLicenseEntries.forEach((entry, i) => {
                          const expirationDateFormatted = toExpiration(entry.deaLicenseExpirationDate);
                          const existingId = existingLicenses[i + 1]?.id ?? entry.id;
                          if (entry.delete && (entry.id != null || existingId != null)) {
                            licenses.push({
                              id: entry.id ?? existingId,
                              deaLicense: entry.deaLicenseNumber,
                              state: entry.deaLicenseState,
                              expirationDate: expirationDateFormatted,
                              delete: true,
                            });
                          } else if (!entry.delete && (entry.deaLicenseDocument || entry.licenseUrl)) {
                            const entryLicense: LicensePayload = {
                              deaLicense: entry.deaLicenseNumber,
                              state: entry.deaLicenseState,
                              expirationDate: expirationDateFormatted,
                            };
                            if (entry.id != null || existingId != null) entryLicense.id = (entry.id ?? existingId) as string | number;
                            if (entry.deaLicenseDocument) entryLicense.license = entry.deaLicenseDocument;
                            licenses.push(entryLicense);
                          }
                        });
                        (variables as Record<string, unknown>).deaLicensesAttributes = licenses.length > 0 ? licenses : undefined;
                      } else if (hasDeaLicense === "No" && user && (user.deaLicenses?.length ?? 0) > 0) {
                        (variables as Record<string, unknown>).deaLicensesAttributes = (user.deaLicenses ?? []).map((d) => ({
                          id: d.id,
                          deaLicense: d.deaLicense ?? "",
                          state: d.state ?? "",
                          expirationDate: d.expirationDate ?? "",
                          delete: true,
                        }));
                      }

                      await updateDoctor({ variables });
                    } catch {
                      // Error is handled by the mutation's onError callback
                    }
                  }}
                  enableReinitialize
                >
                  {({ handleChange, values, setFieldValue, initialValues }) => (
                    <Form>
                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 py-3 md:py-5 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label className="text-xs md:text-sm text-gray-700 font-semibold">
                            First Name
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            name="firstName"
                            value={values.firstName}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="firstName"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 py-3 md:py-5 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label className="text-xs md:text-sm text-gray-700 font-semibold">
                            Last Name
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            name="lastName"
                            value={values.lastName}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="lastName"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label className="text-xs md:text-sm text-gray-700 font-semibold">
                            Email Address
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Phone Number
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="tel"
                            name="phoneNo"
                            value={values.phoneNo}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(
                                e.target.value,
                              );
                              setFieldValue("phoneNo", formatted);
                            }}
                            placeholder="(316) 555-0116"
                            className="[&::-webkit-outer-spin-button]:appearance-none [moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <ErrorMessage
                            name="phoneNo"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            NPI number
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="text"
                            name="npiNumber"
                            value={values.npiNumber}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="npiNumber"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Specialty
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <SelectGroupDropdown
                            selectedGroup={values.specialty}
                            setSelectedGroup={(specialty) => {
                              const selected = Array.isArray(specialty)
                                ? specialty[0]
                                : specialty;
                              setFieldValue("specialty", selected);
                            }}
                            groups={specialities}
                            name=""
                            multiple={false}
                            placeholder="Select specialty"
                            searchTerm={specialtySearchTerm}
                            setSearchTerm={setSpecialtySearchTerm}
                            isShowDrop={true}
                            required
                            paddingClasses="py-2.5 px-3"
                            optionPaddingClasses="p-1"
                            showLabel={false}
                          />
                          <ErrorMessage
                            name="specialty"
                            component="div"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Clinic
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="text"
                            name="clinic"
                            value={values.clinic}
                            onChange={handleChange}
                            placeholder="Enter clinic name"
                          />
                          <ErrorMessage
                            name="clinic"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-start py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3 pt-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Street Address
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <GoogleAutocompleteInput
                            name="street1"
                            value={values.street1}
                            onChange={(value) =>
                              setFieldValue("street1", value)
                            }
                            onAddressSelect={(address) => {
                              // Auto-fill address fields when address is selected
                              setFieldValue("street1", address.street1);
                              setFieldValue("city", address.city);
                              setFieldValue("state", address.state);
                              setFieldValue("postalCode", address.postalCode);
                            }}
                            placeholder="Enter street address"
                            label=""
                          />
                          <ErrorMessage
                            name="street1"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Street Address 2 (Optional)
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="text"
                            name="street2"
                            value={values.street2}
                            onChange={handleChange}
                            placeholder="Apartment, suite, etc. (optional)"
                          />
                          <ErrorMessage
                            name="street2"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            City
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="text"
                            name="city"
                            value={values.city}
                            onChange={handleChange}
                            placeholder="Enter city"
                          />
                          <ErrorMessage
                            name="city"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            State
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="text"
                            name="state"
                            value={values.state}
                            onChange={handleChange}
                            placeholder="Enter state"
                          />
                          <ErrorMessage
                            name="state"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Postal Code
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="text"
                            name="postalCode"
                            value={values.postalCode}
                            onChange={handleChange}
                            placeholder="Enter postal code"
                          />
                          <ErrorMessage
                            name="postalCode"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Shipping Address Same as Billing
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <Switch
                            checked={values.sameAsShippingAddress}
                            onChange={(checked) => {
                              setFieldValue("sameAsShippingAddress", checked);
                              if (checked) {
                                // Clear shipping fields when toggled to true
                                setFieldValue("shippingStreet1", "");
                                setFieldValue("shippingStreet2", "");
                                setFieldValue("shippingCity", "");
                                setFieldValue("shippingState", "");
                                setFieldValue("shippingPostalCode", "");
                              }
                            }}
                            className="group inline-flex cursor-pointer h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-gradient-to-r data-checked:from-[#3C85F5] data-checked:to-[#1A407A]"
                          >
                            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6" />
                          </Switch>
                        </div>
                      </div>

                      {!values.sameAsShippingAddress && (
                        <>
                          <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-start py-3 md:py-6 border-b border-b-gray-200">
                            <div className="col-span-12 md:col-span-4 lg:col-span-3 pt-3">
                              <label
                                htmlFor=""
                                className="text-xs md:text-sm text-gray-700 font-semibold"
                              >
                                Shipping Street Address
                              </label>
                            </div>
                            <div className="col-span-12 md:col-span-8 lg:col-span-8">
                              <GoogleAutocompleteInput
                                name="shippingStreet1"
                                value={values.shippingStreet1}
                                onChange={(value) =>
                                  setFieldValue("shippingStreet1", value)
                                }
                                onAddressSelect={(address) => {
                                  setFieldValue(
                                    "shippingStreet1",
                                    address.street1,
                                  );
                                  setFieldValue("shippingCity", address.city);
                                  setFieldValue("shippingState", address.state);
                                  setFieldValue(
                                    "shippingPostalCode",
                                    address.postalCode,
                                  );
                                }}
                                placeholder="Enter shipping street address"
                                label=""
                              />
                              <ErrorMessage
                                name="shippingStreet1"
                                component="div"
                                className="text-red-500 text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                            <div className="col-span-12 md:col-span-4 lg:col-span-3">
                              <label
                                htmlFor=""
                                className="text-xs md:text-sm text-gray-700 font-semibold"
                              >
                                Shipping Street Address 2 (Optional)
                              </label>
                            </div>
                            <div className="col-span-12 md:col-span-8 lg:col-span-8">
                              <ThemeInput
                                type="text"
                                name="shippingStreet2"
                                value={values.shippingStreet2}
                                onChange={handleChange}
                                placeholder="Apartment, suite, etc. (optional)"
                              />
                              <ErrorMessage
                                name="shippingStreet2"
                                component="div"
                                className="text-red-500 text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                            <div className="col-span-12 md:col-span-4 lg:col-span-3">
                              <label
                                htmlFor=""
                                className="text-xs md:text-sm text-gray-700 font-semibold"
                              >
                                Shipping City
                              </label>
                            </div>
                            <div className="col-span-12 md:col-span-8 lg:col-span-8">
                              <ThemeInput
                                type="text"
                                name="shippingCity"
                                value={values.shippingCity}
                                onChange={handleChange}
                                placeholder="Enter shipping city"
                              />
                              <ErrorMessage
                                name="shippingCity"
                                component="div"
                                className="text-red-500 text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                            <div className="col-span-12 md:col-span-4 lg:col-span-3">
                              <label
                                htmlFor=""
                                className="text-xs md:text-sm text-gray-700 font-semibold"
                              >
                                Shipping State
                              </label>
                            </div>
                            <div className="col-span-12 md:col-span-8 lg:col-span-8">
                              <ThemeInput
                                type="text"
                                name="shippingState"
                                value={values.shippingState}
                                onChange={handleChange}
                                placeholder="Enter shipping state"
                              />
                              <ErrorMessage
                                name="shippingState"
                                component="div"
                                className="text-red-500 text-xs"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:py-6 border-b border-b-gray-200">
                            <div className="col-span-12 md:col-span-4 lg:col-span-3">
                              <label
                                htmlFor=""
                                className="text-xs md:text-sm text-gray-700 font-semibold"
                              >
                                Shipping Postal Code
                              </label>
                            </div>
                            <div className="col-span-12 md:col-span-8 lg:col-span-8">
                              <ThemeInput
                                type="text"
                                name="shippingPostalCode"
                                value={values.shippingPostalCode}
                                onChange={handleChange}
                                placeholder="Enter shipping postal code"
                              />
                              <ErrorMessage
                                name="shippingPostalCode"
                                component="div"
                                className="text-red-500 text-xs"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 items-center py-3 md:pt-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label className="text-xs md:text-sm text-gray-700 font-semibold">
                            DEA License
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8 flex items-center gap-6">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="Yes"
                              name="hasDeaLicense"
                              checked={hasDeaLicense === "Yes"}
                              onChange={() => setHasDeaLicense("Yes")}
                              className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                            />
                            Yes
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              value="No"
                              name="hasDeaLicense"
                              checked={hasDeaLicense === "No"}
                              onChange={() => setHasDeaLicense("No")}
                              className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                            />
                            No
                          </label>
                        </div>
                      </div>

                      {hasDeaLicense === "Yes" && (
                        <div className="grid grid-cols-12 gap-1.5 lg:gap-8 py-3 md:py-6 border-b border-b-gray-200">
                          <div className="col-span-12 space-y-4 bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
                              <div className="w-full" id="deaLicenseNumber">
                                <ThemeInput
                                  label="DEA License"
                                  placeholder="Enter DEA License number"
                                  value={deaLicenseNumber}
                                  onChange={(e) => {
                                    setDeaLicenseNumber(e.target.value);
                                    if (deaErrors.deaLicenseNumber) setDeaErrors((prev) => { const next = { ...prev }; delete next.deaLicenseNumber; return next; });
                                  }}
                                  type="text"
                                  error={!!deaErrors.deaLicenseNumber}
                                  errorMessage={deaErrors.deaLicenseNumber}
                                />
                              </div>
                              <div className="w-full" id="deaLicenseState">
                                <Dropdown
                                  label="State"
                                  placeholder="Select state"
                                  options={US_STATES}
                                  value={deaLicenseState}
                                  onChange={(value) => {
                                    setDeaLicenseState(value);
                                    if (deaErrors.deaLicenseState) setDeaErrors((prev) => { const next = { ...prev }; delete next.deaLicenseState; return next; });
                                  }}
                                  showSearch
                                  searchPlaceholder="Search states..."
                                  error={!!deaErrors.deaLicenseState}
                                  errorMessage={deaErrors.deaLicenseState}
                                />
                              </div>
                              <div className="w-full" id="deaLicenseExpirationDate">
                                <ThemeInput
                                  label="DEA License Expiration"
                                  type="text"
                                  value={deaLicenseExpirationDate}
                                  onChange={(e) => {
                                    setDeaLicenseExpirationDate(formatDeaDate(e.target.value));
                                    if (deaErrors.deaLicenseExpirationDate) setDeaErrors((prev) => { const next = { ...prev }; delete next.deaLicenseExpirationDate; return next; });
                                  }}
                                  placeholder="MM-DD-YYYY (e.g., 01-15-2026)"
                                  maxLength={10}
                                  error={!!deaErrors.deaLicenseExpirationDate}
                                  errorMessage={deaErrors.deaLicenseExpirationDate}
                                />
                              </div>
                            </div>
                            <div id="deaLicenseDocument">
                              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Upload License Document <span className="text-red-600">*</span>
                              </label>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => deaLicenseFileInputRef.current?.click()}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-700 border-r border-gray-200 hover:bg-gray-50"
                                  >
                                    Choose file
                                  </button>
                                  <span className="flex-1 px-4 py-2.5 text-sm text-gray-900 truncate">
                                    {deaLicenseDocument?.name || (firstDeaLicenseUrl ? getFilenameFromActiveStorageUrl(firstDeaLicenseUrl) : "No file chosen")}
                                  </span>
                                  {deaLicenseDocument && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeaLicenseDocument(null);
                                        if (deaLicenseFileInputRef.current) deaLicenseFileInputRef.current.value = "";
                                      }}
                                      className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                      aria-label="Remove file"
                                    >
                                      <CrossIcon width="18" height="18" fill="currentColor" />
                                    </button>
                                  )}
                                </div>
                                {firstDeaLicenseUrl && (
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={`${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${firstDeaLicenseUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:underline rounded-md border border-primary/30 bg-primary/5"
                                    >
                                      <EyeIcon />
                                      Preview
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => setFirstDeaLicenseUrl(null)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md border border-red-200"
                                      aria-label="Delete license"
                                    >
                                      <TrashBinIcon width="14" height="14" />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                              <input
                                ref={deaLicenseFileInputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,application/pdf"
                                onChange={(e) => {
                                  setDeaLicenseDocument(e.target.files?.[0] || null);
                                  if (deaErrors.deaLicenseDocument) setDeaErrors((prev) => { const next = { ...prev }; delete next.deaLicenseDocument; return next; });
                                }}
                              />
                              {deaErrors.deaLicenseDocument && (
                                <p className="mt-1.5 text-sm text-red-600" role="alert">{deaErrors.deaLicenseDocument}</p>
                              )}
                            </div>

                            {deaLicenseEntries.some((e) => !e.delete) && (
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={removeFirstDeaLicenseChunk}
                                  className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
                                  aria-label="Remove license entry"
                                >
                                  <TrashBinIcon width="12" height="12" fill="currentColor" />
                                  Remove
                                </button>
                              </div>
                            )}

                            {deaLicenseEntries
                              .map((entry, index) => ({ entry, index }))
                              .filter(({ entry }) => !entry.delete)
                              .map(({ entry, index }) => {
                                const entryError = (f: string) => deaErrors[`deaLicenseEntries.${index}.${f}`];
                                const clearEntryError = (f: string) => {
                                  const key = `deaLicenseEntries.${index}.${f}`;
                                  if (deaErrors[key]) setDeaErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
                                };
                                return (
                                  <div key={entry.id ?? index} className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
                                      <div className="w-full" id={`deaLicenseEntries.${index}.deaLicenseNumber`}>
                                        <ThemeInput
                                          label="DEA License"
                                          placeholder="Enter DEA License number"
                                          value={entry.deaLicenseNumber}
                                          onChange={(e) => {
                                            updateDeaLicenseEntry(index, "deaLicenseNumber", e.target.value);
                                            clearEntryError("deaLicenseNumber");
                                          }}
                                          type="text"
                                          error={!!entryError("deaLicenseNumber")}
                                          errorMessage={entryError("deaLicenseNumber")}
                                        />
                                      </div>
                                      <div className="w-full" id={`deaLicenseEntries.${index}.deaLicenseState`}>
                                        <Dropdown
                                          label="State"
                                          placeholder="Select state"
                                          options={US_STATES}
                                          value={entry.deaLicenseState}
                                          onChange={(value) => {
                                            updateDeaLicenseEntry(index, "deaLicenseState", value);
                                            clearEntryError("deaLicenseState");
                                          }}
                                          showSearch
                                          searchPlaceholder="Search states..."
                                          error={!!entryError("deaLicenseState")}
                                          errorMessage={entryError("deaLicenseState")}
                                        />
                                      </div>
                                      <div className="w-full" id={`deaLicenseEntries.${index}.deaLicenseExpirationDate`}>
                                        <ThemeInput
                                          label="DEA License Expiration"
                                          type="text"
                                          value={entry.deaLicenseExpirationDate}
                                          onChange={(e) => {
                                            updateDeaLicenseEntry(index, "deaLicenseExpirationDate", formatDeaDate(e.target.value));
                                            clearEntryError("deaLicenseExpirationDate");
                                          }}
                                          placeholder="MM-DD-YYYY (e.g., 01-15-2026)"
                                          maxLength={10}
                                          error={!!entryError("deaLicenseExpirationDate")}
                                          errorMessage={entryError("deaLicenseExpirationDate")}
                                        />
                                      </div>
                                    </div>
                                    <div id={`deaLicenseEntries.${index}.deaLicenseDocument`}>
                                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Upload License Document <span className="text-red-600">*</span></label>
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
                                          <button
                                            type="button"
                                            onClick={() => deaLicenseEntryFileRefs.current[index]?.click()}
                                            className="cursor-pointer px-4 py-2.5 text-sm font-medium text-gray-700 border-r border-gray-200 hover:bg-gray-50"
                                          >
                                            Choose file
                                          </button>
                                          <span className="flex-1 px-4 py-2.5 text-sm text-gray-900 truncate">
                                            {entry.deaLicenseDocument?.name || (entry.licenseUrl ? getFilenameFromActiveStorageUrl(entry.licenseUrl) : "No file chosen")}
                                          </span>
                                          {entry.deaLicenseDocument && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                updateDeaLicenseEntry(index, "deaLicenseDocument", null);
                                                const input = deaLicenseEntryFileRefs.current[index];
                                                if (input) input.value = "";
                                              }}
                                              className="cursor-pointer p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                              aria-label="Remove file"
                                            >
                                              <CrossIcon width="18" height="18" fill="currentColor" />
                                            </button>
                                          )}
                                        </div>
                                        {entry.licenseUrl && (
                                          <div className="flex items-center gap-2">
                                            <a
                                              href={`${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${entry.licenseUrl}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:underline rounded-md border border-primary/30 bg-primary/5"
                                            >
                                              <EyeIcon />
                                              Preview
                                            </a>
                                            <button
                                              type="button"
                                              onClick={() => updateDeaLicenseEntry(index, "licenseUrl", null)}
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md border border-red-200"
                                              aria-label="Delete license"
                                            >
                                              <TrashBinIcon width="14" height="14" />
                                              Delete
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                      <input
                                        ref={(el) => { deaLicenseEntryFileRefs.current[index] = el; }}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,application/pdf"
                                        onChange={(e) => {
                                          updateDeaLicenseEntry(index, "deaLicenseDocument", e.target.files?.[0] || null);
                                          clearEntryError("deaLicenseDocument");
                                        }}
                                      />
                                      {entryError("deaLicenseDocument") && (
                                        <p className="mt-1.5 text-sm font-medium text-red-600" role="alert">{entryError("deaLicenseDocument")}</p>
                                      )}
                                    </div>
                                    <div className="flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => removeDeaLicenseEntry(index)}
                                        className="cursor-pointer flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
                                        aria-label="Remove license entry"
                                      >
                                        <TrashBinIcon width="12" height="12" fill="currentColor" />
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}

                            <button
                              type="button"
                              onClick={addDeaLicenseEntry}
                              className="mt-4 flex items-center gap-2 text-primary font-medium hover:underline cursor-pointer"
                            >
                              <PlusIcon width="20" height="20" />
                              Add New
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex pt-3 md:pt-6 justify-end">
                        <ThemeButton
                          label={updateLoading ? "Saving..." : "Save Changes"}
                          heightClass="h-10"
                          type="submit"
                          className="w-full md:w-fit"
                          disabled={updateLoading}
                        />
                      </div>
                    </Form>
                  )}
                </Formik>
              </TabPanel>

              <TabPanel
                className={
                  "grid grid-cols-1 md:grid-cols-2 p-5 lg:py-0 gap-4 md:gap-8"
                }
              >
                <ChangePassword />
                <div className="p-4 md:p-8 bg-gray-50 rounded-xl flex flex-col gap-2 md:gap-3 border-gray-100 border ">
                  <h2 className="text-black text-xl font-medium">
                    Two-Factor Authentication
                  </h2>

                  <div className="px-3 md:px-6 flex flex-col items-center justify-center gap-1.5 md:gap-3">
                    <SecurityLock />
                    <div>
                      <h2 className="text-gray-900 mb-1.5 font-medium text-sm md:text-xl text-center">
                        Enable 2FA
                      </h2>
                      <p className="text-sm md:text-base text-gray-800 text-center">
                        Add an extra layer of security to your account
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <Switch
                        checked={isTwoFaEnabled}
                        onChange={handleTwoFaToggle}
                        disabled={twoFaUpdating}
                        className={`group inline-flex h-7 w-14 items-center rounded-full bg-gray-200 transition data-checked:bg-gradient-to-r data-checked:from-[#3C85F5] data-checked:to-[#1A407A] ${
                          twoFaUpdating
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <span className="size-5 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-8" />
                      </Switch>
                      <p className="text-xs text-gray-600">
                        {twoFaUpdating
                          ? "Updating..."
                          : isTwoFaEnabled
                            ? "Enabled"
                            : "Disabled"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel className={"flex flex-col p-5 lg:py-0 gap-4 md:gap-6"}>
                {notificationLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500">
                      Loading notification settings...
                    </p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <NotificationToggle
                      key={item.key}
                      icon={item.icon}
                      title={item.title}
                      subtitle={item.subtitle}
                      enabled={toggles[item.key as keyof typeof toggles]}
                      onChange={(val) => handleToggleChange(item.key, val)}
                    />
                  ))
                )}
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default Page;
