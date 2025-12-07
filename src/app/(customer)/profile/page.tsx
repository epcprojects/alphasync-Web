"use client";
import {
  TextAreaField,
  ThemeButton,
  ThemeInput,
  ImageUpload,
} from "@/app/components";
import { InfoIcon, UserIcon } from "@/icons";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, ErrorMessage } from "formik";
import { useIsMobile } from "@/hooks/useIsMobile";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useMutation } from "@apollo/client";
import { UPDATE_CUSTOMER_PROFILE, REMOVE_IMAGE } from "@/lib/graphql/mutations";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";
import Cookies from "js-cookie";

interface ProfileFormValues {
  fullName: string;
  email: string;
  phoneNo: string;
  dateOfBirth: Date;
  address: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
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
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phoneNo: Yup.string()
      .required("Phone number is required")
      .matches(
        /^\(\d{3}\)\s\d{3}-\d{4}$/,
        "Phone number must be in format (512) 312-3123"
      ),
    dateOfBirth: Yup.string().required("Date of Birth is required"),
    address: Yup.string().optional(),
    street1: Yup.string().required("Street address is required"),
    street2: Yup.string().optional(),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    postalCode: Yup.string().required("Postal code is required"),
    country: Yup.string().required("Country is required"),
    emergencyContactName: Yup.string().required(
      "Emergency Contact Name is required"
    ),
    emergencyContactPhone: Yup.string()
      .required("Phone number is required")
      .matches(
        /^\(\d{3}\)\s\d{3}-\d{4}$/,
        "Phone number must be in format (512) 312-3123"
      ),
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
      const variables = {
        fullName: values.fullName,
        phoneNo: values.phoneNo,
        email: values.email,
        dateOfBirth: values.dateOfBirth,
        address: values.address || undefined,
        street1: values.street1 || undefined,
        street2: values.street2 || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        postalCode: values.postalCode || undefined,
        country: values.country || undefined,
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
        fullName: "",
        email: "",
        phoneNo: "",
        dateOfBirth: new Date(),
        address: "",
        street1: "",
        street2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        medicalHistory: "",
        knownAllergies: "",
        currentMedications: "",
        additionalNotes: "",
      };
    }

    return {
      fullName: user.fullName || "",
      email: user.email || "",
      phoneNo: user.phoneNo || "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
      address: user.address || "",
      street1: user.street1 || "",
      street2: user.street2 || "",
      city: user.city || "",
      state: user.state || "",
      postalCode: user.postalCode || "",
      country: user.country || "",
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
                  "flex items-center gap-1 sm:w-fit w-full justify-center md:gap-2 text-[11px] hover:bg-gray-50 whitespace-nowrap md:text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-2 py-3 md:py-4 md:px-6"
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
                  "flex items-center gap-1 md:gap-2 text-[11px] sm:w-fit w-full justify-center hover:bg-gray-50 whitespace-nowrap md:text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-2 py-3 md:py-4 md:px-6"
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
                            Full Name
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            name="fullName"
                            value={values.fullName}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="fullName"
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
                            type="phone"
                            name="phoneNo"
                            value={values.phoneNo}
                            onChange={handleChange}
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
                          <DatePicker
                            name="dateOfBirth"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            wrapperClassName="w-full"
                            placeholderText="mm/dd/yyyy"
                            toggleCalendarOnIconClick
                            selected={
                              values.dateOfBirth
                                ? new Date(values.dateOfBirth)
                                : null
                            }
                            onChange={(date) =>
                              setFieldValue("dateOfBirth", date)
                            }
                            className={`border border-lightGray rounded-lg flex px-2 md:px-3 outline-none focus:ring focus:ring-gray-100 
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
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M11.3335 2.6665V1.6665"
                                  stroke="#6B7280"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M1.6665 6H14.3332"
                                  stroke="#6B7280"
                                  strokeLinecap="round"
                                />
                              </svg>
                            }
                          />
                          <ErrorMessage
                            name="dateOfBirth"
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
                            Street Address
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="text"
                            name="street1"
                            value={values.street1}
                            onChange={handleChange}
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
                            Country
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="text"
                            name="country"
                            value={values.country}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="country"
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
                            Emergency Contact Name
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="emergencyContactName"
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
                            type="emergencyContactPhone"
                            name="emergencyContactPhone"
                            value={values.emergencyContactPhone}
                            onChange={handleChange}
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
