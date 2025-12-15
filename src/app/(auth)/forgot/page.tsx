"use client";
import {
  AuthHeader,
  InfoModal,
  ThemeButton,
  ThemeInput,
} from "@/app/components";
import { Images } from "@/app/ui/images";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { SEND_PASSWORD_INSTRUCTIONS } from "@/lib/graphql/mutations";
const Page = () => {
  const router = useRouter();
  const [isCheckEmailModalOpen, setIsCheckEmailModalOpen] =
    useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [sendPasswordInstructions, { loading }] = useMutation(
    SEND_PASSWORD_INSTRUCTIONS,
    {
      onCompleted: () => {
        setIsCheckEmailModalOpen(true);
        setErrorMessage("");
      },
      onError: (error) => {
        setErrorMessage(
          error.message ||
            "Failed to send password reset instructions. Please try again."
        );
      },
    }
  );

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address.")
      .required("Email is required."),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setErrorMessage("");
      try {
        await sendPasswordInstructions({
          variables: {
            email: values.email,
          },
        });
      } catch {
        // Error is handled by the onError callback
      }
    },
  });

  return (
    <div className="relative flex flex-col  gap-3 md:gap-5 items-center justify-center h-screen">
      <AuthHeader
        logo={Images.auth.logo}
        title="Forgot Your Password?"
        subtitle="Enter your email address below and we’ll send you a link to reset your password."
      />

      <form
        onSubmit={formik.handleSubmit}
        className="md:w-96 flex flex-col gap-5 md:gap-6 w-72 sm:w-84"
      >
        <div className="flex flex-col">
          <ThemeInput
            id="Email"
            label="Email"
            name="email"
            type="email"
            placeholder="abc@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            errorMessage={formik.touched.email ? formik.errors.email : ""}
          />

          {errorMessage && (
            <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
          )}
        </div>
        <ThemeButton
          type="submit"
          disabled={loading || !formik.values.email}
          label={loading ? "Sending..." : "Send Reset Link"}
          heightClass="h-11"
        />
      </form>

      <InfoModal
        isOpen={isCheckEmailModalOpen}
        onClose={() => setIsCheckEmailModalOpen(false)}
        onClick={() => {
          router.push(`/login`);
        }}
        buttonLabel="Back to Login"
        email={formik.values.email}
        title="Check Your Email"
        subtitle="We’ve sent a password reset link to"
        mainText="Please check your inbox and follow the instructions to create a new password."
      />
    </div>
  );
};

export default Page;
