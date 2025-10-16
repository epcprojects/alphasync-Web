"use client";
import {
  AuthHeader,
  InfoModal,
  Loader,
  ThemeButton,
  ThemeInput,
  toastAlert,
} from "@/app/components";
import { Images } from "@/app/ui/images";
import React, { Suspense, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { ACCEPT_INVITATION } from "@/lib/graphql/mutations";
import { showErrorToast } from "@/lib/toast";

function Content() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [acceptInvitation, { loading: acceptLoading }] = useMutation(ACCEPT_INVITATION, {
    onCompleted: (data) => {
     
      setIsModalOpen(true);
    },
    onError: (error) => {
     
      showErrorToast("There is an error accepting the invitation. Please try again.");
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
    onSubmit: (values) => {
      if (!token) {
        showErrorToast("Invalid invitation token");
        return;
      }
      
      acceptInvitation({
        variables: {
          token: token,
          password: values.password,
          passwordConfirmation: values.confirmPassword,
        },
      });
    },
  });

  return (
    <div className="relative flex flex-col  gap-3 md:gap-5 items-center justify-center h-screen">
      <AuthHeader
        logo={Images.auth.logo}
        title="Accept Invitation"
        subtitle="Please confirm your invitation to access your account"
      />

      <form
        onSubmit={formik.handleSubmit}
        className="md:w-96 flex flex-col gap-5 md:gap-6 w-80"
      >
        <div className="flex flex-col gap-5 md:gap-6">
          <ThemeInput
            id="password"
            label="Set Password"
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
            acceptLoading ||
            !formik.values.password ||
            !formik.values.confirmPassword ||
            !token
          }
          label={acceptLoading ? "Processing..." : "Update Password"}
          onClick={() => {}}
          type="submit"
          heightClass="h-11"
        />
      </form>

      <InfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClick={() => {
          setIsModalOpen(false);
          router.push("/login");
        }}
        buttonLabel="Login Now"
        email={""}
        title="Invitation Accepted Successfully"
        subtitle="You can now securely log in to your account."
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
