"use client";
import {
  AuthHeader,
  InfoModal,
  Loader,
  ThemeButton,
  ThemeInput,
} from "@/app/components";
import { Images } from "@/app/ui/images";
import React, { Suspense, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { SET_PASSWORD } from "@/lib/graphql/mutations";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

function Content() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [setPassword, { loading: setPasswordLoading }] = useMutation(SET_PASSWORD, {
    onCompleted: (data) => {
      if (data?.setPassword) {
        showSuccessToast("Password updated successfully!");
        setIsModalOpen(true);
      }
    },
    onError: (error) => {
      showErrorToast(error.message || "Failed to update password");
    },
  });

  const validationSchema = Yup.object({
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Must contain at least one uppercase letter")
      .matches(/[a-z]/, "Must contain at least one lowercase letter")
      .matches(/[0-9]/, "Must contain at least one number")
      .matches(/[@$!%*?&]/, "Must contain at least one special character"),
    confirmPassword: Yup.string()
      .required("Confirm password is required")
      .oneOf([Yup.ref("password")], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!token) {
        showErrorToast("Reset token is missing. Please request a new password reset.");
        return;
      }

      try {
        await setPassword({
          variables: {
            resetPassword: true,
            token: token,
            password: values.password,
            passwordConfirmation: values.confirmPassword,
          },
        });
      } catch {
        // Error is handled by the mutation's onError callback
      }
    },
  });

  return (
    <div className="relative flex flex-col  gap-3 md:gap-5 items-center justify-center h-screen">
      <AuthHeader
        logo={Images.auth.logo}
        title="Set New Password"
        subtitle="Enter a new password below."
      />

      <form
        onSubmit={formik.handleSubmit}
        className="md:w-96 flex flex-col gap-5 md:gap-6 w-80"
      >
        <div className="flex flex-col gap-5 md:gap-6">
          <ThemeInput
            id="password"
            label="New Password"
            name="password"
            type={"password"}
            placeholder="Enter your new password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && !!formik.errors.password}
            errorMessage={formik.errors.password}
          />

          <ThemeInput
            id="confirm-password"
            label="Confirm Password"
            name="confirmPassword"
            type={"password"}
            placeholder="Confirm your password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={
              formik.touched.confirmPassword && !!formik.errors.confirmPassword
            }
            errorMessage={formik.errors.confirmPassword}
          />
        </div>
        <ThemeButton
          disabled={
            formik.isSubmitting ||
            setPasswordLoading ||
            !formik.values.password ||
            !formik.values.confirmPassword ||
            !token
          }
          label={setPasswordLoading ? "Updating..." : "Update Password"}
          onClick={() => {}}
          type="submit"
          heightClass="h-11"
        />
      </form>

      <InfoModal
        isOpen={isModalOpen}
        // onClose={() => setIsModalOpen(false)}
        onClick={() => {
          router.push("/login");
        }}
        buttonLabel="Login Now "
        email={""}
        title="Password Reset Successful"
        subtitle="Your password has been updated successfully. You can now securely log in to your account."
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <Content />
    </Suspense>
  );
}
