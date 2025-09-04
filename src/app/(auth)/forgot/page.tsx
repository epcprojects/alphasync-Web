"use client";
import { AuthHeader, ThemeButton, ThemeInput } from "@/app/components";
import InfoModal from "@/app/components/ui/modals/InfoModal";
import { Images } from "@/app/ui/images";
import React, { useState } from "react";

const Page = () => {
  const [isCheckEmailModalOpen, setIsCheckEmailModalOpen] =
    useState<boolean>(false);

  return (
    <div className="relative flex flex-col  gap-3 md:gap-5 items-center justify-center h-screen">
      <AuthHeader
        logo={Images.auth.logo}
        title="Forgot Your Password?"
        subtitle="Enter your email address below and we’ll send you a link to reset your password."
      />

      <div className="md:w-96 flex flex-col gap-3 md:gap-6 w-80">
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
        <ThemeButton
          disabled={false}
          label="Send Reset Link"
          onClick={() => {
            setIsCheckEmailModalOpen(true);
          }}
        />
      </div>
      <div className="flex items-center gap-1">
        <h2 className="text-xs md:text-sm ">Didn’t receive the OTP?</h2>
        <button
          onClick={() => {}}
          className="text-primary cursor-pointer text-xs md:text-sm font-semibold"
        >
          Click to resend
        </button>
      </div>

      <InfoModal
        isOpen={isCheckEmailModalOpen}
        onClose={() => setIsCheckEmailModalOpen(false)}
        onClick={() => {}}
        buttonLabel="Back to Login"
        email="arina@alphasync.ctexom"
        title="Check Your Email"
        subtitle="We’ve sent a password reset link to"
        mainText="Please check your inbox and follow the instructions to create a new password."
        // type=""
      />
    </div>
  );
};

export default Page;
