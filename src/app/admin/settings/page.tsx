"use client";

import React, { useState } from "react";
import * as Yup from "yup";
import { Formik, Form, ErrorMessage } from "formik";
import { useMutation } from "@apollo/client";
import Cookies from "js-cookie";

import { ThemeButton, ThemeInput, ImageUpload } from "@/app/components";
import { UPDATE_ADMIN, REMOVE_IMAGE } from "@/lib/graphql/mutations";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

// Constants
const PROFILE_SCHEMA = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phoneNo: Yup.string()
    .required("Phone number is required")
    .matches(
      /^\+?[1-9]\d{0,15}$/,
      "Must be a valid phone number (e.g. +1234567890)"
    ),
});

const INITIAL_AVATAR = "/images/arinaProfile.png";

// Types
interface FormValues {
  fullName: string;
  email: string;
  phoneNo: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormFieldProps {
  label: string;
  name: keyof FormValues;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Components
const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
}) => (
  <div className="grid grid-cols-12 items-center py-3 md:py-5 border-b border-gray-200">
    <label className="col-span-3 text-xs md:text-sm font-semibold text-gray-700">
      {label}
    </label>
    <div className="col-span-6">
      <ThemeInput
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-xs"
      />
    </div>
  </div>
);

const AvatarSection: React.FC<{
  imageUrl: string | undefined;
  onImageChange: (file: File | null) => void;
  onImageRemove: () => Promise<void>;
}> = ({ imageUrl, onImageChange, onImageRemove }) => (
  <ImageUpload
    imageUrl={
      imageUrl
        ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${imageUrl}`
        : undefined
    }
    onChange={onImageChange}
    onImageRemove={onImageRemove}
    placeholder={INITIAL_AVATAR}
  />
);

// Page Component
const AdminProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_ADMIN, {
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
  });

  const [removeImage, { loading: removeLoading }] = useMutation(REMOVE_IMAGE, {
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

  const initialValues: FormValues = {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phoneNo: user?.phoneNo ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const variables = {
        fullName: values.fullName,
        email: values.email,
        phoneNo: values.phoneNo,

        ...(values.newPassword && { password: values.newPassword }),
        ...(values.confirmPassword && {
          passwordConfirmation: values.confirmPassword,
        }),
        ...(selectedImage && { image: selectedImage }),
      };

      await updateUser({ variables });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
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

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full mx-auto flex flex-col gap-4 md:gap-6 pt-2">
      <div className="bg-white rounded-xl py-4 md:py-6 px-4 md:px-8">
        <AvatarSection
          imageUrl={user?.imageUrl}
          onImageChange={setSelectedImage}
          onImageRemove={handleImageRemove}
        />

        <Formik
          initialValues={initialValues}
          validationSchema={PROFILE_SCHEMA}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleChange, values }) => (
            <Form className="space-y-0">
              <FormField
                label="Full Name"
                name="fullName"
                value={values.fullName}
                onChange={handleChange}
              />
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
              />
              <FormField
                label="Phone Number"
                name="phoneNo"
                type="phone"
                value={values.phoneNo}
                onChange={handleChange}
              />
              <FormField
                label="Current Password"
                name="currentPassword"
                type="password"
                placeholder="Current Password"
                value={values.currentPassword}
                onChange={handleChange}
              />
              <FormField
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="New Password"
                value={values.newPassword}
                onChange={handleChange}
              />
              <FormField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                value={values.confirmPassword}
                onChange={handleChange}
              />

              <div className="flex justify-end pt-3 md:pt-6">
                <ThemeButton
                  label={updateLoading ? "Saving..." : "Save Changes"}
                  heightClass="h-10"
                  type="submit"
                  disabled={updateLoading}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AdminProfilePage;
