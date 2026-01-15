"use client";
import {
  TextAreaField,
  ThemeButton,
  ThemeInput,
  ImageUpload,
  GoogleAutocompleteInput,
} from "@/app/components";
import { InfoIcon, UserIcon } from "@/icons";
import { Tab, TabGroup, TabList, TabPanel, TabPanels, Switch } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, ErrorMessage } from "formik";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMutation } from "@apollo/client";
import { UPDATE_CUSTOMER_PROFILE, REMOVE_IMAGE } from "@/lib/graphql/mutations";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";
import Cookies from "js-cookie";

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  dateOfBirth: string;
  address: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  sameAsShippingAddress: boolean;
  shippingStreet1: string;
  shippingStreet2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface InformationFormValues {
  medicalHistory: string;
  knownAllergies: string;
  currentMedications: string;
  additionalNotes: string;
}

const Page = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

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
        "Phone number must be in format (512) 312-3123"
      ),
    dateOfBirth: Yup.string()
      .required("Date of Birth is required")
      .matches(
        /^\d{2}-\d{2}-\d{4}$/,
        "Date must be in format MM-DD-YYYY (e.g., 01-15-1990)"
      )
      .test("valid-date", "Please enter a valid date", (value) => {
        if (!value) return false;
        // Parse MM-DD-YYYY format
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
      .test("not-future", "Date of Birth cannot be in the future", (value) => {
        if (!value) return false;
        // Parse MM-DD-YYYY format
        const [month, day, year] = value.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date <= today;
      }),
    address: Yup.string().optional(),
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

  const informationSchema = Yup.object().shape({
    medicalHistory: Yup.string().required("Medical History is required"),
    knownAllergies: Yup.string().required("Known Allergies is required"),
    currentMedications: Yup.string().required(
      "Current Medications is required"
    ),
    additionalNotes: Yup.string().required("Additional Notes is required"),
  });

  const isMobile = useIsMobile();

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

  // Get user data from Redux store
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  // Fallback: If user is not in Redux but exists in cookies, load it
  useEffect(() => {
    if (!user) {
      const userDataFromCookie = Cookies.get("user_data");
      if (userDataFromCookie) {
        try {
          const parsedUser = JSON.parse(userDataFromCookie);
          dispatch(setUser(parsedUser));
        } catch (error) {
          console.error("Error parsing user data from cookie:", error);
        }
      }
    }
  }, [user, dispatch]);

  // Update customer profile mutation
  const [updateCustomerProfile, { loading: updateLoading }] = useMutation(
    UPDATE_CUSTOMER_PROFILE,
    {
      onCompleted: (data) => {
        // Update Redux store with the latest user data
        if (data?.updateUser?.user) {
          dispatch(setUser(data.updateUser.user));
          // Also update the cookie with the latest data
          Cookies.set("user_data", JSON.stringify(data.updateUser.user), {
            expires: 7,
          });
        }
        showSuccessToast("Profile updated successfully!");
      },
      onError: (error) => {
        showErrorToast(error.message || "Failed to update profile");
      },
    }
  );

  // Remove image mutation
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

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file);
  };

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

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    try {
      const isSameAsShipping = values.sameAsShippingAddress;
      const variables = {
        fullName: `${values.firstName} ${values.lastName}`.trim(),
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNo: values.phoneNo,
        email: values.email,
        dateOfBirth: values.dateOfBirth
          ? (() => {
              // Parse MM-DD-YYYY format
              const [month, day, year] = values.dateOfBirth
                .split("-")
                .map(Number);
              const date = new Date(year, month - 1, day);
              return date.toISOString();
            })()
          : undefined,
        address: values.address || undefined,
        street1: values.street1 || undefined,
        street2: values.street2 || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        postalCode: values.postalCode || undefined,
        sameAsBillingAddress: isSameAsShipping,
        shippingStreet1: isSameAsShipping
          ? values.street1 || undefined
          : values.shippingStreet1 || undefined,
        shippingStreet2: isSameAsShipping
          ? values.street2 || undefined
          : values.shippingStreet2 || undefined,
        shippingCity: isSameAsShipping
          ? values.city || undefined
          : values.shippingCity || undefined,
        shippingState: isSameAsShipping
          ? values.state || undefined
          : values.shippingState || undefined,
        shippingPostalCode: isSameAsShipping
          ? values.postalCode || undefined
          : values.shippingPostalCode || undefined,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
        image: selectedImage,
      };
      console.log("Mutation variables:", variables);
      await updateCustomerProfile({ variables });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleInformationSubmit = async (values: InformationFormValues) => {
    console.log("Information form values:", values);
    try {
      const variables = {
        medicalHistory: values.medicalHistory,
        knownAllergies: values.knownAllergies,
        currentMedications: values.currentMedications,
        additionalNotes: values.additionalNotes,
      };
      console.log("Information mutation variables:", variables);
      await updateCustomerProfile({ variables });
    } catch (error) {
      console.error("Error updating information:", error);
    }
  };

  const INITIAL_AVATAR = "/images/arinaProfile.png";

  // Convert user data to form initial values
  const getInitialValues = () => {
    if (!user) {
      return {
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
        sameAsShippingAddress: true,
        shippingStreet1: "",
        shippingStreet2: "",
        shippingCity: "",
        shippingState: "",
        shippingPostalCode: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        medicalHistory: "",
        knownAllergies: "",
        currentMedications: "",
        additionalNotes: "",
      };
    }

    // Split fullName into firstName and lastName if firstName/lastName not available
    const nameParts = (user.fullName || "").split(" ");
    const firstName = user.firstName || nameParts[0] || "";
    const lastName = user.lastName || nameParts.slice(1).join(" ") || "";

    return {
      firstName: firstName,
      lastName: lastName,
      email: user.email || "",
      phoneNo: user.phoneNo || "",
      dateOfBirth: user.dateOfBirth
        ? (() => {
            const date = new Date(user.dateOfBirth);
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const year = date.getFullYear();
            return `${month}-${day}-${year}`;
          })()
        : "",
      address: user.address || "",
      street1: user.street1 || "",
      street2: user.street2 || "",
      city: user.city || "",
      state: user.state || "",
      postalCode: user.postalCode || "",
      sameAsShippingAddress: user.sameAsBillingAddress ?? true,
      shippingStreet1: user.shippingStreet1 || "",
      shippingStreet2: user.shippingStreet2 || "",
      shippingCity: user.shippingCity || "",
      shippingState: user.shippingState || "",
      shippingPostalCode: user.shippingPostalCode || "",
      emergencyContactName: user.emergencyContactName || "",
      emergencyContactPhone: user.emergencyContactPhone || "",
      medicalHistory: user.medicalHistory || "",
      knownAllergies: user.knownAllergies || "",
      currentMedications: user.currentMedications || "",
      additionalNotes: user.additionalNotes || "",
    };
  };

  // Show loading if user data is not available yet
  if (!user) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="bg-white rounded-xl ">
        <div className=" ">
          <TabGroup>
            <TabList
              className={
                "flex items-center border-b border-b-gray-200 gap-2 md:gap-3 md:justify-start  justify-between md:px-6"
              }
            >
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 sm:w-fit w-full justify-center md:gap-2 text-sm hover:bg-gray-50 whitespace-nowrap md:text-base outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-1.5 py-3 md:py-4 md:px-6"
                }
              >
                <UserIcon
                  fill="currentColor"
                  width={isMobile ? "16" : "20"}
                  height={isMobile ? "16" : "20"}
                />
                My Profile
              </Tab>
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 text-sm sm:w-fit w-full justify-center hover:bg-gray-50 whitespace-nowrap md:text-base outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-1.5 py-3 md:py-4 md:px-6"
                }
              >
                <InfoIcon
                  fill="currentColor"
                  width={isMobile ? 16 : 20}
                  height={isMobile ? 16 : 20}
                />
                Other Information
              </Tab>
            </TabList>
            <TabPanels className={"pb-4 lg:p-6"}>
              <TabPanel className={"px-5 lg:px-8"}>
                <div className="grid grid-cols-12 py-3 md:py-5 border-b border-b-gray-200">
                  <div className="col-span-12 mb-3 sm:mb-0 md:col-span-4 lg:col-span-3">
                    <label className="text-xs md:text-sm text-gray-700 font-semibold">
                      Your photo
                    </label>
                    <span className="block text-gray-600 text-xs md:text-sm">
                      This will be displayed on your profile.
                    </span>
                  </div>

                  <ImageUpload
                    imageUrl={
                      user?.imageUrl
                        ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${user?.imageUrl}`
                        : undefined
                    }
                    onChange={handleImageChange}
                    onImageRemove={handleImageRemove}
                    placeholder={INITIAL_AVATAR}
                    className="col-span-12 md:col-span-8 lg:col-span-8"
                    showTitle={false}
                  />
                </div>
                <Formik
                  initialValues={getInitialValues()}
                  validationSchema={profileSchema}
                  onSubmit={handleProfileSubmit}
                  enableReinitialize={true}
                >
                  {({ handleChange, values, setFieldValue }) => (
                    <Form>
                      <div className="grid grid-cols-12 py-3 md:py-5 border-b border-b-gray-200">
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

                      <div className="grid grid-cols-12 py-3 md:py-5 border-b border-b-gray-200">
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

                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
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
                            disabled={true}
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
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
                                e.target.value
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

                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Date of Birth
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="text"
                            name="dateOfBirth"
                            value={values.dateOfBirth}
                            onChange={(e) => {
                              const formatted = formatDate(e.target.value);
                              setFieldValue("dateOfBirth", formatted);
                            }}
                            placeholder="MM-DD-YYYY (e.g., 01-15-1990)"
                            maxLength={10}
                          />
                          <ErrorMessage
                            name="dateOfBirth"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-start py-3 md:py-6 border-b border-b-gray-200">
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

                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
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

                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
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
                          />
                          <ErrorMessage
                            name="city"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
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
                          />
                          <ErrorMessage
                            name="state"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
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
                          />
                          <ErrorMessage
                            name="postalCode"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
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
                          <div className="grid grid-cols-12 items-start py-3 md:py-6 border-b border-b-gray-200">
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
                                    address.street1
                                  );
                                  setFieldValue("shippingCity", address.city);
                                  setFieldValue("shippingState", address.state);
                                  setFieldValue(
                                    "shippingPostalCode",
                                    address.postalCode
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

                          <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
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

                          <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
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

                          <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
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

                          <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
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

                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Emergency Contact Name
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="text"
                            name="emergencyContactName"
                            value={values.emergencyContactName}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="emergencyContactName"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Emergency Contact Phone
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="tel"
                            name="emergencyContactPhone"
                            value={values.emergencyContactPhone}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(
                                e.target.value
                              );
                              setFieldValue("emergencyContactPhone", formatted);
                            }}
                            placeholder="(316) 555-0116"
                            className="[&::-webkit-outer-spin-button]:appearance-none [moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <ErrorMessage
                            name="emergencyContactPhone"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>
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

              <TabPanel className={"px-4 md:px-8"}>
                <Formik
                  initialValues={{
                    medicalHistory: user?.medicalHistory || "",
                    knownAllergies: user?.knownAllergies || "",
                    currentMedications: user?.currentMedications || "",
                    additionalNotes: user?.additionalNotes || "",
                  }}
                  validationSchema={informationSchema}
                  onSubmit={handleInformationSubmit}
                  enableReinitialize={true}
                >
                  {({ handleChange, values }) => (
                    <Form className="flex flex-col w-full">
                      <div className="grid grid-cols-12 items-start py-3 w-full md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Medical History
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <TextAreaField
                            name="medicalHistory"
                            onChange={handleChange}
                            value={values.medicalHistory}
                            placeholder="Enter relevant medical history"
                            heightClasses="min-h-20 max-h-32"
                          />
                          <ErrorMessage
                            name="medicalHistory"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-12 items-start py-3 w-full md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Known Allergies
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <TextAreaField
                            name="knownAllergies"
                            onChange={handleChange}
                            value={values.knownAllergies}
                            placeholder="List any known allergies"
                            heightClasses="min-h-20 max-h-32"
                          />
                          <ErrorMessage
                            name="knownAllergies"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-12 items-start py-3 w-full md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Current Medications
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <TextAreaField
                            name="currentMedications"
                            onChange={handleChange}
                            value={values.currentMedications}
                            placeholder="List current medications and dosages"
                            heightClasses="min-h-20 max-h-32"
                          />
                          <ErrorMessage
                            name="currentMedications"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-12 items-start py-3 w-full md:py-6 border-b border-b-gray-200">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Additional Notes
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <TextAreaField
                            name="additionalNotes"
                            onChange={handleChange}
                            value={values.additionalNotes}
                            placeholder="Enter any additional notes about the customer"
                            heightClasses="min-h-20 max-h-32"
                          />
                          <ErrorMessage
                            name="additionalNotes"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

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
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default Page;
