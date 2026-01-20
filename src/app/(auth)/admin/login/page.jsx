"use client";
import { AuthHeader, Loader, ThemeButton, ThemeInput } from "@/app/components";
import { Images } from "@/app/ui/images";
import Link from "next/link";
import React, { Suspense, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { Checkbox } from "@headlessui/react";
import { TickIcon } from "@/icons";
import { useMutation } from "@apollo/client/react";
import { LOGIN_USER } from "@/lib/graphql/mutations";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import Cookies from "js-cookie";
import { useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";

function AdminLoginContext() {
  const router = useRouter();
  const dispatch = useAppDispatch();

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
        window.location.href = "/admin/doctors";
        showSuccessToast(message);
      }
    },
    onError: (error) => {
      showErrorToast(error.message);
    },
  });

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Please enter a valid email address.")
      .required("Email is required."),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters.")
      .required("Password is required."),
    rememberMe: Yup.boolean(),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema,
    onSubmit: (values) => {
      const dataForOtp = {
        userType: "ADMIN",
        email: values.email,
        rememberMe: values.rememberMe,
      };

      // Clear any old data and set new admin data
      localStorage.removeItem("dataForOtp");
      localStorage.setItem("dataForOtp", JSON.stringify(dataForOtp));

      console.log("Admin login - Stored dataForOtp:", dataForOtp);
      console.log(
        "Admin login - Verified localStorage:",
        localStorage.getItem("dataForOtp")
      );

      loginUser({
        variables: {
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
          userType: "ADMIN",
        },
      });
    },
  });

  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      <AuthHeader
        logo={Images.auth.logo}
        subtitle="Please enter your details to log in"
        title="Welcome back"
      />

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
          <ThemeInput
            id="password"
            label="Password"
            name="password"
            type={"password"}
            placeholder="••••••••"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            errorMessage={formik.touched.password ? formik.errors.password : ""}
          />
        </div>

        <div className="flex justify-between items-center">
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
          <Link
            href={"/forgot"}
            className="text-xs font-semibold text-decoration-none text-primary md:text-sm"
          >
            Forget Password?
          </Link>
        </div>

        <ThemeButton
          label="Login"
          type="submit"
          disabled={loginLoading}
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
      <AdminLoginContext />
    </Suspense>
  );
}
