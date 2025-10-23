"use client";
import {
  AuthHeader,
  InfoModal,
  Loader,
  ThemeButton,
  ThemeInput,
} from "@/app/components";
import { Images } from "@/app/ui/images";
import React, { Suspense, useState, useEffect } from "react";
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
  const doctorParam = searchParams.get("doctor");

  // Debug logging

  // Handle both correct format (?token=...&doctor=true) and incorrect format (?token=...?doctor=true)
  // Also check if URL contains doctor=true anywhere
  const urlString = typeof window !== "undefined" ? window.location.href : "";
  const hasDoctorTrue = urlString.includes("doctor=true");

  const isDoctor =
    doctorParam === "true" ||
    doctorParam === "true?doctor=true" ||
    doctorParam?.includes("true") ||
    hasDoctorTrue;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasAutoExecuted, setHasAutoExecuted] = useState(false);
  const [invitationAccepted, setInvitationAccepted] = useState(false);

  const [acceptInvitation, { loading: acceptLoading }] = useMutation(
    ACCEPT_INVITATION,
    {
      onCompleted: () => {
        setInvitationAccepted(true);
        setIsModalOpen(true);
      },
      onError: () => {
        showErrorToast(
          "There is an error accepting the invitation. Please try again."
        );
      },
    }
  );

  // Auto-run mutation when doctor=false or doctor param is not "true" - only once
  useEffect(() => {
    if (isDoctor !== true && token && !acceptLoading && !hasAutoExecuted) {
      console.log("Auto-running mutation for non-doctor invitation");
      setHasAutoExecuted(true);
      acceptInvitation({
        variables: {
          token: token,
        },
      });
    }
  }, [isDoctor, token, acceptLoading, hasAutoExecuted, acceptInvitation]);

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

      {isDoctor === true ? (
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
                formik.touched.confirmPassword &&
                !!formik.errors.confirmPassword
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
      ) : (
        <div className="md:w-96 flex flex-col gap-5 md:gap-6 w-80 items-center">
          {invitationAccepted ? (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Invitation Accepted!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your invitation has been successfully processed.
                </p>
              </div>
              <ThemeButton
                label="Go to Login"
                onClick={() => router.push("/login")}
                heightClass="h-11"
                className="w-full"
              />
            </div>
          ) : (
            <div className="text-center py-8">
              {acceptLoading && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Please wait...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
