"use client";
import { AuthHeader, ThemeButton, ThemeInput } from "@/app/components";
import { Images } from "@/app/ui/images";
import Link from "next/link";
import React, { useState } from "react";

const Page = () => {
  const [loginType, setLoginType] = useState("Doctor");

  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      <AuthHeader
        logo={Images.auth.logo}
        defaultValue={loginType}
        options={["Customer", "Doctor"]}
        onToggleChange={(val) => setLoginType(val)}
        subtitle="Please enter your details to log in"
        title="Welcome back"
      />

      <form className="md:w-96 flex flex-col gap-3 md:gap-6 w-80">
        <div className="flex flex-col gap-5">
          <ThemeInput
            id="Email"
            label="Email"
            name="email"
            type={"email"}
            placeholder="abc@example.com"
            // value={formData.username}
            // onChange={handleChange}
            error={false}
            errorMessage="Please enter a valid email address."
          />
          {loginType === "Doctor" && (
            <ThemeInput
              id="password"
              label="Password"
              name="password"
              type={"password"}
              placeholder="••••••••"
              // value={formData.username}
              // onChange={handleChange}
              error={false}
              errorMessage="Please enter a valid email address."
            />
          )}
        </div>

        <div className="flex justify-between  aling-center">
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
              Remember me
            </label>
          </div>
          <Link
            href={"/forgot"}
            className="text-xs font-semibold text-decoration-none text-primary md:text-sm"
          >
            Forget Password?
          </Link>
        </div>

        <ThemeButton label="Login" onClick={() => {}} />
      </form>
    </div>
  );
};

export default Page;
