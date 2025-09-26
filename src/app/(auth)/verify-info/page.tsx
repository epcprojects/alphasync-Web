"use client";
import { AuthHeader, InfoList, ThemeButton } from "@/app/components";
import { Images } from "@/app/ui/images";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function VerifyInfoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email");

  return (
    <div className="relative flex flex-col  gap-3 md:gap-5 items-center justify-center h-screen">
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
              { label: "Full Name", value: "John Smith" },
              { label: "Contact", value: "(316) 555-0116" },
              { label: "Email", value: email },
              { label: "Date of Birth", value: "3/22/2006" },
              {
                label: "Address",
                value: "3517 W. Gray St. Utica, Pennsylvania 57867",
              },
            ]}
          />
        </div>

        <ThemeButton
          className=""
          disabled={false}
          label="Continue"
          onClick={() => {
            router.push("/pending-payments");
          }}
          heightClass="h-11"
        />
      </div>
      <div className="flex items-center gap-1">
        <h2 className="text-sm md:text-base ">Incorrect information?</h2>
        <button
          onClick={() => router.push("/profile")}
          className="text-primary cursor-pointer text-xs md:text-sm font-semibold"
        >
          Edit now
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyInfoContent />
    </Suspense>
  );
}
