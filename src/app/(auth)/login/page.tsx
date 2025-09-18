"use client";
import { AuthHeader, ThemeButton, ThemeInput } from "@/app/components";
import { Images } from "@/app/ui/images";
import Link from "next/link";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";

type LoginType = "Customer" | "Doctor";

const Page = () => {
  const [loginType, setLoginType] = useState("Doctor");
  const router = useRouter();

  const validationSchema = Yup.object().shape({
    loginType: Yup.mixed<LoginType>().oneOf(["Customer", "Doctor"]).required(),
    email: Yup.string()
      .email("Please enter a valid email address.")
      .required("Email is required."),
    password:
      loginType === "Doctor"
        ? Yup.string()
            .min(6, "Password must be at least 6 characters.")
            .required("Password is required.")
        : Yup.string().notRequired(),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      loginType,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form submitted:", values);
      router.push(`/otp?loginType=${values.loginType}&email=${values.email}`);
    },
    enableReinitialize: true,
  });

  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
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
            <input
              id="default-checkbox"
              type="checkbox"
              value=""
              className="w-4 h-4 rounded accent-primary focus:ring-0 focus:ring-primarylight"
            />
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
};

export default Page;
