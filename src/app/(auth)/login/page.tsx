"use client";
import { AuthHeader, Loader, ThemeButton, ThemeInput } from "@/app/components";
import { Images } from "@/app/ui/images";
import Link from "next/link";
import React, { Suspense, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@headlessui/react";
import { TickIcon } from "@/icons";
import { useMutation } from "@apollo/client/react";
import { LOGIN_USER, SEND_OTP } from "@/lib/graphql/mutations";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import Cookies from "js-cookie";
import { useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";

type LoginType = "Patient" | "Doctor";

function LoginContext() {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const isAdminLogin = searchParams.get("admin") === "admin";
  const typeParam = searchParams.get("type");

  // Set initial login type based on URL parameter, default to "Doctor"
  const initialLoginType = typeParam === "patient" ? "Patient" : "Doctor";
  const [loginType, setLoginType] = useState(initialLoginType);

  const [loginUser, { loading: loginLoading }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      const message = data?.loginUser?.message;
      if (!!data?.loginUser?.user?.twoFaEnabled) {
        router.push("/otp");
        showSuccessToast(message);
      } else {
        const token = data?.loginUser?.token ?? "";
        const user = data?.loginUser?.user ?? null;
        dispatch(setUser(user));
        Cookies.set("auth_token", token, { expires: 7 });
        Cookies.set("user_data", JSON.stringify(user), { expires: 7 });
        window.location.href = "/inventory";
        showSuccessToast(message);
      }
    },
    onError: (error) => {
      showErrorToast(error.message);
    },
  });

  const [sendOtp, { loading: sendOtpLoading }] = useMutation(SEND_OTP, {
    onCompleted: (data) => {
      const message = data?.sendOtp?.message;
      showSuccessToast(message);
      router.push("/otp");
    },
    onError: (error) => {
      showErrorToast(error.message);
    },
  });

  const validationSchema = Yup.object().shape({
    loginType: Yup.mixed<LoginType>().oneOf(["Patient", "Doctor"]).required(),
    email: Yup.string()
      .email("Please enter a valid email address.")
      .required("Email is required."),
    password:
      loginType === "Doctor"
        ? Yup.string()
            .min(8, "Password must be at least 8 characters.")
            .required("Password is required.")
        : Yup.string().notRequired(),
    rememberMe: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      loginType,
      rememberMe: false,
    },
    validationSchema,
    onSubmit: (values) => {
      const dataForOtp = {
        userType: isAdminLogin ? "ADMIN" : loginType.toUpperCase(),
        email: values.email,
        rememberMe: values.rememberMe,
      };
      localStorage.setItem("dataForOtp", JSON.stringify(dataForOtp));

      // Use SEND_OTP for Patient type, LOGIN_USER for Doctor/Admin
      if (loginType === "Patient") {
        sendOtp({
          variables: {
            email: values.email,
          },
        });
      } else {
        loginUser({
          variables: {
            email: values.email,
            password: values.password,
            rememberMe: values.rememberMe,
            userType: isAdminLogin ? "ADMIN" : values.loginType.toUpperCase(),
          },
        });
      }
    },
    enableReinitialize: true,
  });

  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      {isAdminLogin ? (
        <AuthHeader
          logo={Images.auth.logo}
          subtitle="Please enter your details to log in"
          title="Welcome back"
        />
      ) : (
        <AuthHeader
          logo={Images.auth.logo}
          defaultValue={loginType}
          options={["Patient", "Doctor"]}
          onToggleChange={(val) => {
            setLoginType(val);
            formik.setFieldValue("loginType", val);
            if (val !== "Doctor") {
              formik.setFieldValue("password", "");
              formik.setFieldTouched("password", false);
            }
            formik.validateForm();
          }}
          subtitle="Please enter your details to log in"
          title="Welcome back"
        />
      )}

      <form
        onSubmit={formik.handleSubmit}
        className="md:w-96 flex flex-col gap-5 md:gap-6 w-72 sm:w-84"
      >
        <div className="flex flex-col gap-5 md:gap-6">
          <ThemeInput
            id="Email"
            label="Email"
            name="email"
            type={"email"}
            placeholder="abc@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            errorMessage={formik.touched.email ? formik.errors.email : ""}
          />
          {loginType === "Doctor" && (
            <ThemeInput
              id="password"
              label="Password"
              name="password"
              type={"password"}
              placeholder="••••••••"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              errorMessage={
                formik.touched.password ? formik.errors.password : ""
              }
            />
          )}
        </div>

        <div className="flex justify-between items-center">
          {loginType !== "Patient" && (
            <div className="flex items-center ">
              <Checkbox
                checked={formik.values.rememberMe}
                onChange={(val) => formik.setFieldValue("rememberMe", val)}
                className="group size-6 rounded-sm bg-white/10 p-1 ring-1 ring-lightGray ring-inset focus:not-data-focus:outline-none data-checked:bg-primary  data-checked:ring-primary data-focus:outline data-focus:outline-offset-2 data-focus:outline-white"
              >
                <span className="hidden h-4 w-4 items-center justify-center  group-data-checked:flex">
                  <TickIcon />
                </span>
              </Checkbox>
              <label
                htmlFor="default-checkbox"
                className="text-xs select-none font-medium text-gray-700 ms-2 md:text-sm "
              >
                Remember for 30 days
              </label>
            </div>
          )}
          <Link
            href={"/forgot"}
            className={`text-xs font-semibold text-decoration-none text-primary md:text-sm ${
              loginType === "Patient" ? "ml-auto" : ""
            }`}
          >
            Forget Password?
          </Link>
        </div>

        <ThemeButton
          label="Login"
          type="submit"
          disabled={loginLoading || sendOtpLoading}
          onClick={() => {}}
          heightClass="h-11"
        />
      </form>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <LoginContext />
    </Suspense>
  );
}
