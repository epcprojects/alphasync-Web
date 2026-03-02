"use client";

import {
  ThemeButton,
  ThemeInput,
  ImageUpload,
} from "@/app/components";
import { UserIcon } from "@/icons";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import React, { useState, useEffect, useMemo } from "react";
import * as Yup from "yup";
import { Formik, Form, ErrorMessage } from "formik";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMutation } from "@apollo/client";
import { UPDATE_DOCTOR, REMOVE_IMAGE } from "@/lib/graphql/mutations";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";
import Cookies from "js-cookie";

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
}

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
      "Phone number must be in format (000) 000-0000"
    ),
});

const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, "");
  const limitedNumbers = numbers.slice(0, 10);
  if (limitedNumbers.length === 0) return "";
  if (limitedNumbers.length <= 3) return `(${limitedNumbers}`;
  if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3)}`;
  }
  return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3, 6)}-${limitedNumbers.slice(6)}`;
};

const INITIAL_AVATAR = "/images/arinaProfile.png";

export default function ManagerProfilePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const isMobile = useIsMobile();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

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

  const [updateProfile, { loading: updateLoading }] = useMutation(
    UPDATE_DOCTOR,
    {
      onCompleted: (data) => {
        if (data?.updateUser?.user) {
          dispatch(setUser(data.updateUser.user));
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

  const handleImageChange = (file: File | null) => setSelectedImage(file);

  const handleImageRemove = async () => {
    try {
      await removeImage({
        variables: { id: user?.id, removeImage: true },
      });
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  const profileInitialValues = useMemo((): ProfileFormValues => {
    if (!user) {
      return {
        firstName: "",
        lastName: "",
        email: "",
        phoneNo: "",
      };
    }
    const nameParts = (user.fullName || "").split(" ");
    const firstName = user.firstName || nameParts[0] || "";
    const lastName = user.lastName || nameParts.slice(1).join(" ") || "";
    return {
      firstName,
      lastName,
      email: user.email || "",
      phoneNo: user.phoneNo || "",
    };
  }, [user]);

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile({
        variables: {
          fullName: `${values.firstName} ${values.lastName}`.trim(),
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNo: values.phoneNo,
          email: values.email,
          image: selectedImage,
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

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
      <div className="bg-white rounded-xl">
        <TabGroup>
          <TabList className="flex items-center border-b border-b-gray-200 gap-2 md:gap-3 md:justify-start justify-between md:px-6">
            <Tab
              as="button"
              className="flex items-center gap-1 sm:w-fit w-full justify-center md:gap-2 text-sm hover:bg-gray-50 whitespace-nowrap md:text-base outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer text-gray-500 px-1.5 py-3 md:py-4 md:px-6"
            >
              <UserIcon
                fill="currentColor"
                width={isMobile ? "16" : "20"}
                height={isMobile ? "16" : "20"}
              />
              My Profile
            </Tab>
          </TabList>
          <TabPanels className="pb-4 lg:p-6">
            <TabPanel className="px-5 lg:px-8">
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
                initialValues={profileInitialValues}
                validationSchema={profileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
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
                          disabled
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                      <div className="col-span-12 md:col-span-4 lg:col-span-3">
                        <label className="text-xs md:text-sm text-gray-700 font-semibold">
                          Phone Number
                        </label>
                      </div>
                      <div className="col-span-12 md:col-span-8 lg:col-span-8">
                        <ThemeInput
                          type="tel"
                          name="phoneNo"
                          value={values.phoneNo}
                          onChange={(e) => {
                            setFieldValue(
                              "phoneNo",
                              formatPhoneNumber(e.target.value)
                            );
                          }}
                          placeholder="(000) 000-0000"
                          className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <ErrorMessage
                          name="phoneNo"
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
  );
}
