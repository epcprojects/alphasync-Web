"use client";
import { NotificationToggle, ThemeButton, ThemeInput } from "@/app/components";
import {
  AccountSettingsIcon,
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

const Page = () => {
  const [toggles, setToggles] = useState({
    email: true,
    sms: false,
    orders: true,
    stock: true,
  });

  const notifications = [
    {
      key: "email",
      icon: <MailIcon />,
      title: "Email Notifications",
      subtitle: "Receive notifications via email",
    },
    {
      key: "sms",
      icon: <MessageSquareIcon />,
      title: "SMS Notifications",
      subtitle: "Receive urgent notifications via SMS",
    },
    {
      key: "orders",
      icon: <PackageOutlineIcon fill="#6B7280" height="22" width="22" />,
      title: "Order Updates",
      subtitle: "Get notified about order status changes",
    },
    {
      key: "stock",
      icon: <AlertIcon />,
      title: "Low Stock Alerts",
      subtitle: "Get alerts when inventory is running low",
    },
  ];

  const profileSchema = Yup.object().shape({
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, "Invalid phone number")
      .required("Phone number is required"),
    license: Yup.string().required("Medical license is required"),
    specialty: Yup.string().required("Specialty is required"),
  });

  const passwordSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .min(6, "New password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm new password is required"),
  });

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-8 pt-2 mx-auto">
      <div className="flex items-center gap-2 md:gap-4">
        <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
          <AccountSettingsIcon />
        </span>
        <h2 className="text-black font-semibold text-lg md:text-3xl">
          Settings
        </h2>
      </div>

      <div className="bg-white rounded-xl ">
        <div className=" ">
          <TabGroup>
            <TabList
              className={
                "flex items-center border-b border-b-gray-200  px-4 md:px-6"
              }
            >
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 text-xs md:text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 md:py-4 md:px-6"
                }
              >
                <UserIcon fill="currentColor" width="20" height="20" />
                My Profile
              </Tab>
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 outline-none text-xs md:text-sm border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 md:py-4 md:px-6"
                }
              >
                <LockIcon fill="currentColor" />
                Change Password
              </Tab>
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 outline-none text-xs md:text-sm border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 md:py-4 md:px-6"
                }
              >
                <ReminderIcon fill="currentColor" />
                Notifications
              </Tab>
            </TabList>
            <TabPanels className={"p-4 md:p-6"}>
              <TabPanel className={"px-4 md:px-8"}>
                <Formik
                  initialValues={{
                    fullName: "Dr. Arina Baker",
                    email: "arina@alphasync.com",
                    phone: "(316) 555-0116",
                    license: "MD-12345-67890",
                    specialty: "Internal Medicine",
                  }}
                  validationSchema={profileSchema}
                  onSubmit={(values) => {
                    console.log("Profile Values:", values);
                  }}
                >
                  {({ handleChange, values }) => (
                    <Form>
                      <div className="grid grid-cols-12 py-3 md:py-5 border-b border-b-gray-200">
                        <div className="col-span-3">
                          <label className="text-xs md:text-sm text-gray-700 font-semibold">
                            Full Name
                          </label>
                        </div>
                        <div className="col-span-6">
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
                        <div className="col-span-3">
                          <label className="text-xs md:text-sm text-gray-700 font-semibold">
                            Email Address
                          </label>
                        </div>
                        <div className="col-span-6">
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
                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Phone Number
                          </label>
                        </div>
                        <div className="col-span-6">
                          <ThemeInput
                            type="phone"
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="phone"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Medical License
                          </label>
                        </div>
                        <div className="col-span-6">
                          <ThemeInput
                            type="license"
                            name="license"
                            value={values.license}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="license"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                        <div className="col-span-3">
                          <label
                            htmlFor=""
                            className="text-xs md:text-sm text-gray-700 font-semibold"
                          >
                            Specialty
                          </label>
                        </div>
                        <div className="col-span-6">
                          <ThemeInput
                            type="specialty"
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
                          label="Save Changes"
                          heightClass="h-10"
                          type="submit"
                        />
                      </div>
                    </Form>
                  )}
                </Formik>
              </TabPanel>

              <TabPanel className={"grid grid-cols-2 gap-4 md:gap-8"}>
                <Formik
                  initialValues={{
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }}
                  validationSchema={passwordSchema}
                  onSubmit={(values) => {
                    console.log("Password Values:", values);
                  }}
                >
                  {({ handleChange, values }) => (
                    <Form className="flex flex-col gap-2 md:gap-4">
                      <h2 className="text-black font-medium text-sm md:text-lg">
                        Change Password
                      </h2>
                      <div className="flex flex-col gap-3 md:gap-5">
                        <div>
                          <ThemeInput
                            type="password"
                            name="currentPassword"
                            label="Current Password"
                            placeholder="Current Password"
                            value={values.currentPassword}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="currentPassword"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>

                        <div>
                          <ThemeInput
                            type="password"
                            name="newPassword"
                            label="New Password"
                            required
                            placeholder="New Password"
                            value={values.newPassword}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="newPassword"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                        <div>
                          <ThemeInput
                            type="password"
                            name="confirmPassword"
                            label="Confirm New Password"
                            required
                            placeholder="Confirm New Password"
                            value={values.confirmPassword}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="confirmPassword"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <ThemeButton
                          label="Update Password"
                          heightClass="h-10"
                          type="submit"
                        />
                      </div>
                    </Form>
                  )}
                </Formik>
                <div className="p-4 md:p-8 bg-gray-50 rounded-xl border-gray-100 border ">
                  <h2 className="text-black text-sm md:text-lg font-medium">
                    Two-Factor Authentication
                  </h2>

                  <div className="px-3 md:px-6 flex flex-col items-center justify-center gap-1.5 md:gap-3">
                    <SecurityLock />
                    <h2 className="text-gray-900 font-medium text-sm md:text-lg text-center">
                      Enable 2FA
                    </h2>
                    <p className="text-sm md:text-base text-gray-800 text-center">
                      Add an extra layer of security to your account
                    </p>

                    <div className="flex">
                      <ThemeButton
                        variant="outline"
                        label="Configure"
                        onClick={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel className={"flex flex-col gap-4 md:gap-6"}>
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
