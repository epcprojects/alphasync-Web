"use client";
import { AuthHeader, ThemeButton } from "@/app/components";
import { Images } from "@/app/ui/images";
import React from "react";

const Page = () => {
  return (
    <div className="relative flex flex-col  gap-3 md:gap-5 items-center justify-center h-screen">
      <AuthHeader
        width="md:w-[480px] w-80"
        logo={Images.auth.logo}
        title="Please verify below information"
      />
      <div className="w-80 flex flex-col gap-3 md:gap-5 md:w-[480px]">
        <div className="rounded-xl flex flex-col gap-1 md:gap-3 bg-gray-100  w-full p-3 md:p-4">
          <h2 className="text-gray-900 text-sm md:text-base mb-0 font-semibold ">
            Personal Information
          </h2>

          <div>
            <div className="flex items-center py-1.5 border-b gap-1 md:gap-2 border-b-gray-200 justify-between">
              <span className="text-gray-900 text-xs md:text-sm font-normal block">
                Full Name
              </span>
              <span className="text-gray-900 text-xs md:text-sm block font-semibold">
                John Smith
              </span>
            </div>
            <div className="flex items-center py-1.5 border-b gap-1 md:gap-2 border-b-gray-200 justify-between">
              <span className="text-gray-900 text-xs md:text-sm block">
                Contact
              </span>
              <span className="text-gray-900 text-xs md:text-sm block font-semibold">
                (316) 555-0116
              </span>
            </div>
            <div className="flex items-center py-1.5 border-b gap-1 md:gap-2 border-b-gray-200 justify-between">
              <span className="text-gray-900 text-xs md:text-sm block">
                Email
              </span>
              <span className="text-gray-900 text-xs md:text-sm block font-semibold">
                john.smith@email.com
              </span>
            </div>

            <div className="flex items-center py-1.5 border-b gap-1 md:gap-2 border-b-gray-200 justify-between">
              <span className="text-gray-900 text-xs md:text-sm block">
                Date of Birth
              </span>
              <span className="text-gray-900 text-xs md:text-sm block font-semibold">
                3/22/2006
              </span>
            </div>

            <div className="flex items-center py-1.5 border-b gap-1 md:gap-2 border-b-gray-200 justify-between">
              <span className="text-gray-900 text-xs md:text-sm block">
                Address
              </span>
              <span className="text-gray-900 text-xs md:text-sm block font-semibold">
                3517 W. Gray St. Utica, Pennsylvania 57867
              </span>
            </div>
          </div>
        </div>

        <ThemeButton
          className=""
          disabled={false}
          label="Continue"
          onClick={() => {}}
        />
      </div>
      <div className="flex items-center gap-1">
        <h2 className="text-xs md:text-sm ">Incorrect information?</h2>
        <button
          onClick={() => {}}
          className="text-primary cursor-pointer text-xs md:text-sm font-semibold"
        >
          Edit now
        </button>
      </div>
    </div>
  );
};

export default Page;
