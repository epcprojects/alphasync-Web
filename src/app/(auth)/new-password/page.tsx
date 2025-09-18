"use client";
import {
  AuthHeader,
  InfoModal,
  ThemeButton,
  ThemeInput,
} from "@/app/components";
import { Images } from "@/app/ui/images";
import React, { Suspense, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";

function Content() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const email = searchParams.get("email");

  const [isModalOpen, setIsModalOpen] = useState(false);

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
    onSubmit: (values) => {
      console.log("Submitted values:", values);
      setIsModalOpen(true);
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
          disabled={formik.isSubmitting}
          label="Update Password"
          onClick={() => {}}
          type="submit"
          heightClass="h-11"
        />
      </form>
      <div className="flex items-center gap-1">
        <h2 className="text-xs md:text-sm ">Didn’t receive the OTP?</h2>
        <button
          onClick={() => {}}
          className="text-primary cursor-pointer text-xs md:text-sm font-semibold"
        >
          Click to resend
        </button>
      </div>
      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
}
