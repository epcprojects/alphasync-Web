"use client";
import { AuthHeader, Loader, ThemeButton } from "@/app/components";
import { Images } from "@/app/ui/images";
import { InfoIcon } from "@/icons";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import OTPInput from "react-otp-input";
import { toast } from "react-toastify";

function OTPContent() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const loginType = searchParams.get("loginType"); // "Doctor" or "Customer"
  const email = searchParams.get("email");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("verify");

    if (otp === "123456") {
      setError(false);
      console.log("OTP Verified");
      if (loginType === "Doctor") {
        router.push("/inventory");
      } else if (loginType === "Customer") {
        router.push(`/verify-info?email=${email}`);
      } else if (loginType === "admin") {
        router.push(`/admin/doctors`);
      } else {
        router.push("/login");
      }
    } else {
      setError(true);
      toast.error(`Incorrect OTP`, {
        position: "top-left",
        icon: <InfoIcon />,
        closeButton: false,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          position: "fixed",
          top: "20%",
          left: "20%",
          width: "160px",
          maxHeight: "44px",
          minHeight: "44px",
          backgroundColor: "#FEF3F2",
          padding: "8px",
          color: "#111827",
        },
      });
    }
  };
  return (
    <div className="relative flex flex-col  gap-6 md:gap-8 items-center justify-center h-screen">
      <AuthHeader logo={Images.auth.logo} title="Verify OTP" />

      <form
        onSubmit={handleVerify}
        className="md:w-96 flex flex-col gap-5 md:gap-6 w-80"
      >
        <div className="flex flex-col gap-3 md:gap-4">
          <label className="text-base text-gray-600">
            Please enter the OTP <span className="text-red-500">*</span>
          </label>
          <OTPInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (error) setError(false); // reset error when typing
            }}
            numInputs={6}
            placeholder="000000"
            inputType="number"
            containerStyle={
              "flex items-center gap-2 justify-center w-full select-none"
            }
            inputStyle={`bg-white !w-full h-13 font-semibold text-center placeholder:text-gray-200 border text-[32px] [&::-webkit-outer-spin-button]:appearance-none [moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none rounded-lg outline-primary text-gray-800 focus:ring-1 focus:ring-gray-300 select-none ${
              error ? "border-red-500" : "border-lightGray"
            }`}
            renderInput={(props) => <input {...props} />}
          />
        </div>
        <ThemeButton
          disabled={otp.length < 6 || error}
          label="Verify"
          type="submit"
          heightClass="h-11"
        />
      </form>
      <div className="flex items-center gap-1">
        <h2 className="text-sm text-vampire-gray">Didn’t receive the OTP?</h2>
        <button
          onClick={() => {
            setOtp("");
            setError(false);
          }}
          className="text-primary cursor-pointer text-sm font-semibold"
        >
          Click to resend
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <OTPContent />
    </Suspense>
  );
}
