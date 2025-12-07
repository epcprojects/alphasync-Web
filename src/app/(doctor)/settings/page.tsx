"use client";
import {
  ChangePassword,
  NotificationToggle,
  ThemeButton,
  ThemeInput,
  ImageUpload,
} from "@/app/components";
import {
  AlertIcon,
  LockIcon,
  MailIcon,
  MessageSquareIcon,
  PackageOutlineIcon,
  ReminderIcon,
  SecurityLock,
  UserIcon,
} from "@/icons";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import React, { useState } from "react";
import * as Yup from "yup";
import { Formik, Form, ErrorMessage } from "formik";
import { useMutation } from "@apollo/client";
import Cookies from "js-cookie";
import { useIsMobile } from "@/hooks/useIsMobile";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { UPDATE_DOCTOR, REMOVE_IMAGE } from "@/lib/graphql/mutations";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";

const Page = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [toggles, setToggles] = useState({
    email: true,
    sms: false,
    orders: true,
    stock: true,
  });

  const isMobile = useIsMobile();

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

  const INITIAL_AVATAR = "/images/arinaProfile.png";

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
    medicalLicense: Yup.string().required("Medical license is required"),
    specialty: Yup.string().required("Specialty is required"),
  });

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
                  "flex items-center gap-1 md:gap-2 text-[11px] whitespace-nowrap md:text-sm hover:bg-gray-50 outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-2 py-3 md:py-4 md:px-6"
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
                  "flex items-center gap-1 md:gap-2 outline-none text-xs md:text-sm border-b-2 hover:bg-gray-50 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-2 py-3 md:py-4 md:px-6"
                }
              >
                <LockIcon
                  fill="currentColor"
                  width={isMobile ? "16" : "20"}
                  height={isMobile ? "16" : "20"}
                />
                Change Password
              </Tab>
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 outline-none text-xs md:text-sm border-b-2 hover:bg-gray-50 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-2 py-3 md:py-4 md:px-6"
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
            <TabPanels className={"pb-4 lg:p-6"}>
              <TabPanel className={"px-5 lg:px-8"}>
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
                    fullName: user?.fullName ?? "",
                    email: user?.email ?? "",
                    phoneNo: user?.phoneNo ?? "",
                    medicalLicense: user?.medicalLicense ?? "",
                    specialty: user?.specialty ?? "",
                  }}
                  validationSchema={profileSchema}
                  onSubmit={async (values) => {
                    try {
                      const variables = {
                        fullName: values.fullName,
                        email: values.email,
                        phoneNo: values.phoneNo,
                        medicalLicense: values.medicalLicense,
                        specialty: values.specialty,
                        ...(selectedImage && { image: selectedImage }),
                      };

                      await updateDoctor({ variables });
                    } catch {
                      // Error is handled by the mutation's onError callback
                    }
                  }}
                  enableReinitialize
                >
                  {({ handleChange, values }) => (
                    <Form>
                      <div className="grid grid-cols-12 gap-1.5 lg:gap-8 py-3 md:py-5 border-b border-b-gray-200">
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
                            onChange={handleChange}
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
                            Medical License
                          </label>
                        </div>
                        <div className="col-span-12 md:col-span-8 lg:col-span-8">
                          <ThemeInput
                            type="text"
                            name="medicalLicense"
                            value={values.medicalLicense}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="medicalLicense"
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
                          <ThemeInput
                            type="text"
                            name="specialty"
                            value={values.specialty}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="specialty"
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

                    <div className="flex">
                      <ThemeButton
                        variant="outline"
                        label="Configure"
                        onClick={() => {}}
                        className="w-full md:w-fit"
                      />
                    </div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel className={"flex flex-col p-5 lg:py-0 gap-4 md:gap-6"}>
                {notifications.map((item) => (
                  <NotificationToggle
                    key={item.key}
                    icon={item.icon}
                    title={item.title}
                    subtitle={item.subtitle}
                    enabled={toggles[item.key as keyof typeof toggles]}
                    onChange={(val) =>
                      setToggles((prev) => ({ ...prev, [item.key]: val }))
                    }
                  />
                ))}
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default Page;
