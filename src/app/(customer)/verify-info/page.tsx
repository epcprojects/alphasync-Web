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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  dateOfBirth: Date | null;
};

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phoneNo: Yup.string()
    .required("Phone number is required")
    .matches(phoneNumberRegex, PHONE_MESSAGE),
  address: Yup.string().required("Address is required"),
  dateOfBirth: Yup.date().nullable().required("Date of Birth is required"),
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

function VerifyInfoContent() {
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialValues = useMemo<VerifyInfoFormValues>(
    () => ({
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
      phoneNo: formatPhoneNumber(currentUser?.phoneNo || ""),
      address: currentUser?.address || "",
      dateOfBirth: currentUser?.dateOfBirth
        ? new Date(currentUser.dateOfBirth)
        : null,
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
        if (updatedUser) {
          dispatch(setUser(updatedUser));
          Cookies.set("user_data", JSON.stringify(updatedUser), { expires: 7 });
        }
        window.location.href = "/pending-payments";
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
      dateOfBirth: values.dateOfBirth
        ? values.dateOfBirth.toISOString().split("T")[0]
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

                  <div>
                    <span className="block mb-1 text-sm text-gray-700 font-medium text-start">
                      Date of Birth
                    </span>
                    <DatePicker
                      wrapperClassName="block w-full"
                      selected={formik.values.dateOfBirth}
                      onChange={(date) => {
                        const selectedDate = Array.isArray(date)
                          ? date[0]
                          : date;
                        formik.setFieldValue("dateOfBirth", selectedDate);
                      }}
                      onBlur={() => formik.setFieldTouched("dateOfBirth", true)}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={new Date()}
                      minDate={new Date(1900, 0, 1)}
                      className={`w-full focus:ring h-11 px-3 py-2.5 border rounded-lg outline-none text-gray-900 placeholder:text-gray-500 ${
                        formik.touched.dateOfBirth && formik.errors.dateOfBirth
                          ? "border-red-500 focus:ring-red-200"
                          : "border-lightGray focus:ring-gray-200"
                      }`}
                      placeholderText="mm/dd/yyyy"
                    />
                    {formik.touched.dateOfBirth &&
                      formik.errors.dateOfBirth && (
                        <p className="mt-1 text-xs text-red-500">
                          {formik.errors.dateOfBirth as string}
                        </p>
                      )}
                  </div>

                  <ThemeInput
                    label="Address"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      formik.touched.address && formik.errors.address
                    )}
                    errorMessage={
                      formik.touched.address
                        ? (formik.errors.address as string)
                        : undefined
                    }
                  />
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
