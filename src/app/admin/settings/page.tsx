"use client";
import { ThemeButton, ThemeInput } from "@/app/components";
import React from "react";
import * as Yup from "yup";
import { Formik, Form, ErrorMessage } from "formik";
import AvatarUploader from "@/app/components/AvatarUploader";
const Page = () => {
  const profileSchema = Yup.object().shape({
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/, "Invalid phone number")
      .required("Phone number is required"),
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Must contain at least one uppercase letter")
      .matches(/[a-z]/, "Must contain at least one lowercase letter")
      .matches(/[0-9]/, "Must contain at least one number")
      .matches(/[@$!%*?&]/, "Must contain at least one special character"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm new password is required"),
  });

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="bg-white rounded-xl py-4 md:py-6">
        <div className={"px-4 md:px-8"}>
          <div className="grid grid-cols-12 py-3 md:py-5 border-b border-b-gray-200">
            <div className="col-span-3">
              <label className="text-xs md:text-sm text-gray-700 font-semibold">
                Your photo
              </label>
              <span className="block text-gray-600 text-xs md:text-sm">
                This will be displayed on your profile.
              </span>
            </div>

            <AvatarUploader
              initialImage="/images/arinaProfile.png"
              onChange={(file) => {
                if (file) {
                  console.log("New image selected:", file);
                  // send to API
                } else {
                  console.log("Image deleted");
                  // handle delete API call
                }
              }}
            />
          </div>
          <Formik
            initialValues={{
              fullName: "Daniel Baker",
              email: "daniel.baker@alphasync.com",
              phone: "(316) 555-0116",
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
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

                <div className="grid grid-cols-12 items-center py-3 pt-6 ">
                  <div className="col-span-3">
                    <label
                      htmlFor=""
                      className="text-xs md:text-sm text-gray-700 font-semibold"
                    >
                      Current Password
                    </label>
                  </div>
                  <div className="col-span-6">
                    <ThemeInput
                      type="password"
                      name="currentPassword"
                      placeholder="Current Password"
                      value={values.currentPassword}
                      onChange={handleChange}
                      required
                    />
                    <ErrorMessage
                      name="currentPassword"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 items-center py-3 ">
                  <div className="col-span-3">
                    <label
                      htmlFor=""
                      className="text-xs md:text-sm text-gray-700 font-semibold"
                    >
                      New Password
                    </label>
                  </div>
                  <div className="col-span-6">
                    <ThemeInput
                      type="password"
                      name="newPassword"
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
                </div>

                <div className="grid grid-cols-12 items-center py-3  ">
                  <div className="col-span-3">
                    <label
                      htmlFor=""
                      className="text-xs md:text-sm text-gray-700 font-semibold"
                    >
                      Confirm New Password
                    </label>
                  </div>
                  <div className="col-span-6">
                    <ThemeInput
                      type="password"
                      name="confirmPassword"
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
        </div>
      </div>
    </div>
  );
};

export default Page;
