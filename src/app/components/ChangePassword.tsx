"use client";
import React from "react";
import { ErrorMessage, Form, Formik } from "formik";
import ThemeInput from "@/app/components/ui/inputs/ThemeInput";
import ThemeButton from "@/app/components/ui/buttons/ThemeButton";
import * as Yup from "yup";
import { useMutation } from "@apollo/client";
import { UPDATE_PASSWORD } from "@/lib/graphql/mutations";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

const ChangePassword = () => {
  const [updatePassword, { loading: updatePasswordLoading }] = useMutation(
    UPDATE_PASSWORD,
    {
      onCompleted: (data) => {
        if (data?.updatePassword?.response) {
          showSuccessToast("Password updated successfully!");
        }
      },
      onError: (error) => {
        showErrorToast(error.message || "Failed to update password");
      },
    }
  );

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
    <Formik
      initialValues={{
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }}
      validationSchema={passwordSchema}
      onSubmit={async (values) => {
        try {
          await updatePassword({
            variables: {
              currentPassword: values.currentPassword,
              password: values.newPassword,
              passwordConfirmation: values.confirmPassword,
            },
          });
        } catch (error) {
          // Error is handled by the mutation's onError callback
        }
      }}
    >
      {({ handleChange, values }) => (
        <Form className="flex flex-col gap-2 md:gap-4">
          <h2 className="text-black font-medium text-xl ">Change Password</h2>
          <div className="flex flex-col gap-3 md:gap-5">
            <div>
              <ThemeInput
                type="password"
                name="currentPassword"
                label="Current Password"
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
              label={updatePasswordLoading ? "Updating..." : "Update Password"}
              heightClass="h-10 "
              type="submit"
              className="w-full md:w-fit"
              disabled={updatePasswordLoading}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ChangePassword;
