"use client";
import { AuthHeader, Loader, ThemeButton } from "@/app/components";
import { Images } from "@/app/ui/images";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import OTPInput from "react-otp-input";
import { useMutation } from "@apollo/client/react";
import { LOGIN_WITH_OTP, RESEND_OTP } from "@/lib/graphql/mutations";
import { useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";
import { UserAttributes } from "@/lib/graphql/attributes";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import Cookies from "js-cookie";

interface LoginWithOtpResponse {
  loginWithOtp: {
    token?: string;
    user?: UserAttributes;
  };
}
interface StoredOtpData {
  userType?: string;
  email?: string;
  rememberMe?: boolean;
}

function OTPContent() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(false);
  const [storedData, setStoredData] = useState<StoredOtpData>({});
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = JSON.parse(localStorage.getItem("dataForOtp") || "{}");
      setStoredData(data);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const [loginWithOtp, { loading: otpLoading }] =
    useMutation<LoginWithOtpResponse>(LOGIN_WITH_OTP, {
      onCompleted: (data) => {
        const token = data?.loginWithOtp?.token ?? "";
        const user = data?.loginWithOtp?.user ?? null;

        if (token) {
          Cookies.set("auth_token", token, { expires: 7 });
        }

        if (user) {
          Cookies.set("user_data", JSON.stringify(user), { expires: 7 });
        }
        dispatch(setUser(user));

        showSuccessToast("Logged in successfully!");

        if (storedData?.userType === "DOCTOR") {
          window.location.href = "/inventory";
        } else if (storedData?.userType === "PATIENT") {
          if (user?.addressVerified) {
            window.location.href = "/pending-payments";
          } else {
            window.location.href = "/verify-info";
          }
        } else if (storedData?.userType === "ADMIN") {
          router.push(`/admin/dashboard`);
        } else {
          router.push("/login");
        }
      },
      onError: (error) => {
        showErrorToast(error.message);
      },
    });

  const [resendOtp, { loading: resendLoading }] = useMutation(RESEND_OTP, {
    onCompleted: () => {
      showSuccessToast("OTP sent successfully!");
      setTimer(60);
      setCanResend(false);
    },
    onError: (error) => {
      showErrorToast(error.message);
    },
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginWithOtp({
        variables: {
          email: storedData?.email,
          otp: otp,
          rememberMe: storedData?.rememberMe,
        },
      });
    } catch (error) {
      console.error("OTP verification error:", error);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;

    try {
      await resendOtp({
        variables: {
          email: storedData?.email,
        },
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
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
              if (error) setError(false);
            }}
            numInputs={6}
            placeholder="000000"
            inputType="number"
            containerStyle={
              "flex items-center gap-2 justify-center w-full select-none"
            }
            inputStyle={`bg-white !w-full h-13 font-semibold text-center placeholder:text-gray-200 border text-[32px] [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none rounded-lg outline-primary text-gray-800 focus:ring-1 focus:ring-gray-300 select-none ${
              error ? "border-red-500" : "border-lightGray"
            }`}
            renderInput={(props) => <input {...props} />}
          />
        </div>
        <ThemeButton
          disabled={otp.length < 6 || error || otpLoading}
          label={otpLoading ? "Verifying..." : "Verify"}
          type="submit"
          heightClass="h-11"
        />
      </form>
      <div className="flex items-center gap-1">
        <h2 className="text-sm text-vampire-gray">
          {"Didn't receive the OTP?"}
        </h2>
        {canResend ? (
          <button
            onClick={handleResendOtp}
            disabled={resendLoading}
            className="text-primary cursor-pointer text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? "Sending..." : "Click to resend"}
          </button>
        ) : (
          <span className="text-sm text-gray-500">Resend in {timer}s</span>
        )}
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
