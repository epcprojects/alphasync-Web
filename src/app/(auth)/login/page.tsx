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

type LoginType = "Customer" | "Doctor";

function LoginContext() {
  const [loginType, setLoginType] = useState("Doctor");
  const router = useRouter();
  const params = useSearchParams();
  const redirectedFrom = params.get("redirectedFrom");

  console.log(redirectedFrom);

  const validationSchema = Yup.object().shape({
    loginType: Yup.mixed<LoginType>().oneOf(["Customer", "Doctor"]).required(),
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
      console.log("Form submitted:", values);

      const loginTypeIs =
        redirectedFrom === "admin" ? redirectedFrom : values.loginType;

      router.push(
        `/otp?loginType=${loginTypeIs}&email=${values.email}&rememberMe=${values.rememberMe}`
      );
    },
    enableReinitialize: true,
  });

  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      {redirectedFrom === "admin" ? (
        <AuthHeader
          logo={Images.auth.logo}
          // defaultValue={loginType}
          // options={["Customer", "Doctor"]}
          // onToggleChange={(val) => {
          //   setLoginType(val);
          //   formik.setFieldValue("loginType", val);
          //   if (val !== "Doctor") {
          //     formik.setFieldValue("password", "");
          //     formik.setFieldTouched("password", false);
          //   }
          //   formik.validateForm();
          // }}
          subtitle="Please enter your details to log in"
          title="Welcome back"
        />
      ) : (
        <AuthHeader
          logo={Images.auth.logo}
          defaultValue={loginType}
          options={["Customer", "Doctor"]}
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
        className="md:w-96 flex flex-col gap-5 md:gap-6 w-80"
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

        <div className="flex justify-between   aling-center">
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
          disabled={formik.isSubmitting}
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
