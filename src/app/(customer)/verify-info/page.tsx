"use client";
import {
  AppModal,
  AuthHeader,
  InfoList,
  Loader,
  ThemeButton,
  ThemeInput,
} from "@/app/components";
import { Images } from "@/app/ui/images";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";
import {
  UPDATE_CUSTOMER_PROFILE,
  UPDATE_USER_ADDRESS_VERIFIED,
} from "@/lib/graphql/mutations";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import React, { Suspense, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

const PHONE_MESSAGE = "Phone number must be in format (512) 312-3123";
const phoneNumberRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;

type VerifyInfoFormValues = {
  fullName: string;
  email: string;
  phoneNo: string;
  address: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;

  dateOfBirth: string;
};

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phoneNo: Yup.string()
    .required("Phone number is required")
    .matches(phoneNumberRegex, PHONE_MESSAGE),
  address: Yup.string().optional(),
  street1: Yup.string().required("Street address is required"),
  street2: Yup.string().optional(),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  postalCode: Yup.string().required("Postal code is required"),

  dateOfBirth: Yup.string()
    .required("Date of Birth is required")
    .matches(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date must be in format YYYY-MM-DD (e.g., 1990-01-15)"
    )
    .test("valid-date", "Please enter a valid date", (value) => {
      if (!value) return false;
      const date = new Date(value);
      return date instanceof Date && !isNaN(date.getTime());
    })
    .test("not-future", "Date of Birth cannot be in the future", (value) => {
      if (!value) return false;
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date <= today;
    }),
});

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length === 0) return "";
  if (digits.length < 4) {
    return `(${digits}`;
  }
  if (digits.length < 7) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

// Format date to YYYY-MM-DD format
const formatDate = (value: string): string => {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, "");

  // Limit to 8 digits (YYYYMMDD)
  const limitedNumbers = numbers.slice(0, 8);

  // Format based on length
  if (limitedNumbers.length === 0) return "";
  if (limitedNumbers.length <= 4) return limitedNumbers;
  if (limitedNumbers.length <= 6) {
    return `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(4)}`;
  }
  return `${limitedNumbers.slice(0, 4)}-${limitedNumbers.slice(
    4,
    6
  )}-${limitedNumbers.slice(6)}`;
};

function VerifyInfoContent() {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const initialValues = useMemo<VerifyInfoFormValues>(
    () => ({
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
      phoneNo: formatPhoneNumber(currentUser?.phoneNo || ""),
      address: currentUser?.address || "",
      street1: currentUser?.street1 || "",
      street2: currentUser?.street2 || "",
      city: currentUser?.city || "",
      state: currentUser?.state || "",
      postalCode: currentUser?.postalCode || "",

      dateOfBirth: currentUser?.dateOfBirth
        ? new Date(currentUser.dateOfBirth).toISOString().split("T")[0]
        : "",
    }),
    [currentUser]
  );

  const [updateCustomerProfile, { loading: updateLoading }] = useMutation(
    UPDATE_CUSTOMER_PROFILE,
    {
      onCompleted: (data) => {
        const updatedUser = data?.updateUser?.user;
        if (updatedUser) {
          dispatch(setUser(updatedUser));
          Cookies.set("user_data", JSON.stringify(updatedUser), { expires: 7 });
        }
        showSuccessToast("Information updated successfully!");
        setIsModalOpen(false);
      },
      onError: (error) => {
        showErrorToast(error.message || "Failed to update information");
      },
    }
  );

  const [updateAddressVerified, { loading: addressVerifiedLoading }] =
    useMutation(UPDATE_USER_ADDRESS_VERIFIED, {
      onCompleted: (data) => {
        const updatedUser = data?.updateUser?.user;
        const baseUser = updatedUser || currentUser;
        if (baseUser) {
          const userWithVerifiedAddress = {
            ...baseUser,
            addressVerified: true,
          };
          dispatch(setUser(userWithVerifiedAddress));
          Cookies.set("user_data", JSON.stringify(userWithVerifiedAddress), {
            expires: 7,
          });
        }
        router.replace("/pending-payments");
      },
      onError: (error) => {
        showErrorToast(
          error.message ||
            "Failed to mark address as verified. Please try again."
        );
      },
    });

  const handleContinue = async () => {
    try {
      await updateAddressVerified({
        variables: { addressVerified: true },
      });
    } catch (error) {
      console.error("Error verifying address:", error);
    }
  };

  const handleSubmit = async (
    values: VerifyInfoFormValues,
    actions: FormikHelpers<VerifyInfoFormValues>
  ) => {
    const variables: Record<string, unknown> = {
      fullName: values.fullName || undefined,
      email: values.email || undefined,
      phoneNo: values.phoneNo || undefined,
      address: values.address || undefined,
      street1: values.street1 || undefined,
      street2: values.street2 || undefined,
      city: values.city || undefined,
      state: values.state || undefined,
      postalCode: values.postalCode || undefined,

      dateOfBirth: values.dateOfBirth
        ? new Date(values.dateOfBirth).toISOString().split("T")[0]
        : undefined,
    };

    try {
      await updateCustomerProfile({ variables });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative flex flex-col gap-3 md:gap-5 items-center justify-center max-h-screen">
        <AuthHeader
          width="md:w-[480px] w-80"
          logo={Images.auth.logo}
          title="Please verify below information"
        />
        <div className="w-80 flex flex-col gap-3 md:gap-5 lg:gap-8 md:w-[480px]">
          <div className="rounded-xl flex flex-col gap-1 md:gap-3 bg-gray-100  w-full p-3 md:p-4">
            <h2 className="text-gray-900 text-sm md:text-base mb-0 font-semibold ">
              Personal Information
            </h2>

            <InfoList
              items={[
                { label: "Full Name", value: currentUser?.fullName },
                { label: "Contact", value: currentUser?.phoneNo },
                { label: "Email", value: currentUser?.email },
                {
                  label: "Date of Birth",
                  value: currentUser?.dateOfBirth
                    ? new Date(currentUser.dateOfBirth).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }
                      )
                    : undefined,
                },
                {
                  label: "Street Address",
                  value: currentUser?.street1,
                },
                {
                  label: "Street Address 2",
                  value: currentUser?.street2,
                },
                {
                  label: "City",
                  value: currentUser?.city,
                },
                {
                  label: "State",
                  value: currentUser?.state,
                },
                {
                  label: "Postal Code",
                  value: currentUser?.postalCode,
                },

                {
                  label: "Address",
                  value: currentUser?.address,
                },
              ]}
            />
          </div>

          <ThemeButton
            label={addressVerifiedLoading ? "Please wait..." : "Continue"}
            onClick={handleContinue}
            heightClass="h-11"
            disabled={addressVerifiedLoading}
          />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-sm md:text-base ">Incorrect information?</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-primary cursor-pointer text-xs md:text-sm font-semibold"
          >
            Edit now
          </button>
        </div>
      </div>

      {isModalOpen && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          validateOnMount
          onSubmit={handleSubmit}
        >
          {(formik) => {
            const handleClose = () => {
              if (updateLoading || formik.isSubmitting) return;
              formik.resetForm();
              setIsModalOpen(false);
            };

            return (
              <AppModal
                isOpen={isModalOpen}
                onClose={handleClose}
                title="Update Information"
                confirmLabel={
                  updateLoading || formik.isSubmitting
                    ? "Saving..."
                    : "Save changes"
                }
                onConfirm={formik.submitForm}
                confimBtnDisable={
                  updateLoading ||
                  formik.isSubmitting ||
                  !formik.isValid ||
                  !formik.dirty
                }
                outSideClickClose={!updateLoading && !formik.isSubmitting}
                disableCloseButton={updateLoading || formik.isSubmitting}
                onCancel={handleClose}
              >
                <Form className="flex flex-col gap-4">
                  <ThemeInput
                    label="Full Name"
                    name="fullName"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      formik.touched.fullName && formik.errors.fullName
                    )}
                    errorMessage={
                      formik.touched.fullName
                        ? formik.errors.fullName
                        : undefined
                    }
                  />

                  <ThemeInput
                    label="Email"
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.email && formik.errors.email)}
                    errorMessage={
                      formik.touched.email ? formik.errors.email : undefined
                    }
                    disabled={true}
                  />

                  <ThemeInput
                    label="Phone Number"
                    name="phoneNo"
                    placeholder="(512) 312-3123"
                    value={formik.values.phoneNo}
                    onChange={(event) =>
                      formik.setFieldValue(
                        "phoneNo",
                        formatPhoneNumber(event.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      formik.touched.phoneNo && formik.errors.phoneNo
                    )}
                    errorMessage={
                      formik.touched.phoneNo ? formik.errors.phoneNo : undefined
                    }
                  />

                  <ThemeInput
                    label="Date of Birth"
                    name="dateOfBirth"
                    placeholder="YYYY-MM-DD (e.g., 1990-01-15)"
                    value={formik.values.dateOfBirth}
                    onChange={(event) =>
                      formik.setFieldValue(
                        "dateOfBirth",
                        formatDate(event.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      formik.touched.dateOfBirth && formik.errors.dateOfBirth
                    )}
                    errorMessage={
                      formik.touched.dateOfBirth
                        ? (formik.errors.dateOfBirth as string)
                        : undefined
                    }
                    maxLength={10}
                  />

                  <ThemeInput
                    required
                    label="Street Address"
                    name="street1"
                    placeholder="Enter street address"
                    value={formik.values.street1}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      formik.touched.street1 && formik.errors.street1
                    )}
                    errorMessage={
                      formik.touched.street1
                        ? (formik.errors.street1 as string)
                        : undefined
                    }
                  />

                  <ThemeInput
                    label="Street Address 2 (Optional)"
                    name="street2"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={formik.values.street2}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      formik.touched.street2 && formik.errors.street2
                    )}
                    errorMessage={
                      formik.touched.street2
                        ? (formik.errors.street2 as string)
                        : undefined
                    }
                  />

                  <div className="flex items-center gap-3 md:gap-5 w-full">
                    <div className="w-full">
                      <ThemeInput
                        required
                        label="City"
                        name="city"
                        placeholder="Enter city"
                        value={formik.values.city}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(
                          formik.touched.city && formik.errors.city
                        )}
                        errorMessage={
                          formik.touched.city
                            ? (formik.errors.city as string)
                            : undefined
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="w-full">
                      <ThemeInput
                        required
                        label="State"
                        name="state"
                        placeholder="Enter state"
                        value={formik.values.state}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(
                          formik.touched.state && formik.errors.state
                        )}
                        errorMessage={
                          formik.touched.state
                            ? (formik.errors.state as string)
                            : undefined
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:gap-5 w-full">
                    <div className="w-full">
                      <ThemeInput
                        required
                        label="Postal Code"
                        name="postalCode"
                        placeholder="Enter postal code"
                        value={formik.values.postalCode}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(
                          formik.touched.postalCode && formik.errors.postalCode
                        )}
                        errorMessage={
                          formik.touched.postalCode
                            ? (formik.errors.postalCode as string)
                            : undefined
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </Form>
              </AppModal>
            );
          }}
        </Formik>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <VerifyInfoContent />
    </Suspense>
  );
}
