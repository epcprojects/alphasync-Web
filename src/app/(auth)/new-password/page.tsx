"use client";
import { AuthHeader, ThemeButton, ThemeInput } from "@/app/components";
import { Images } from "@/app/ui/images";
import React from "react";

const Page = () => {
  return (
    <div className="relative flex flex-col  gap-3 md:gap-5 items-center justify-center h-screen">
      <AuthHeader logo={Images.auth.logo} title="Verify OTP" />

      <form className="md:w-96 flex flex-col gap-3 md:gap-6 w-80">
        <div className="flex flex-col gap-5">
          <ThemeInput
            id="password"
            label="New Password"
            name="password"
            type={"password"}
            placeholder="Enter your new password"
            // value={formData.username}
            // onChange={handleChange}
            error={false}
            errorMessage="Please enter a valid email address."
          />

          <ThemeInput
            id="confirm-password"
            label="Confirm Password"
            name="confirm-password"
            type={"password"}
            placeholder="Confirm your password"
            // value={formData.username}
            // onChange={handleChange}
            error={false}
            errorMessage="Please enter a valid email address."
          />
        </div>
        <ThemeButton
          disabled={true}
          label="Update Password"
          onClick={() => {}}
        />
      </form>
      <div className="flex items-center gap-1">
        <h2 className="text-xs md:text-sm ">Didn’t receive the OTP?</h2>
        <button
          onClick={() => {}}
          className="text-primary cursor-pointer text-xs md:text-sm font-semibold"
        >
          Click to resend
        </button>
      </div>
    </div>
  );
};

export default Page;
