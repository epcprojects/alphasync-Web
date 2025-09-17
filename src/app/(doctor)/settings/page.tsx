"use client";
import { ThemeButton, ThemeInput } from "@/app/components";
import {
  AccountSettingsIcon,
  LockIcon,
  ReminderIcon,
  SecurityLock,
  UserIcon,
} from "@/icons";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-8 pt-2 mx-auto">
      <div className="flex items-center gap-2 md:gap-4">
        <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
          <AccountSettingsIcon />
        </span>
        <h2 className="text-black font-semibold text-lg md:text-3xl">
          Settings
        </h2>
      </div>

      <div className="bg-white rounded-xl ">
        <div className=" ">
          <TabGroup>
            <TabList
              className={
                "flex items-center border-b border-b-gray-200  px-4 md:px-6"
              }
            >
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 text-xs md:text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 md:py-4 md:px-6"
                }
              >
                <UserIcon fill="currentColor" width="20" height="20" />
                My Profile
              </Tab>
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 outline-none text-xs md:text-sm border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 md:py-4 md:px-6"
                }
              >
                <LockIcon fill="currentColor" />
                Change Password
              </Tab>
              <Tab
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 outline-none text-xs md:text-sm border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 md:py-4 md:px-6"
                }
              >
                <ReminderIcon fill="currentColor" />
                Notifications
              </Tab>
            </TabList>
            <TabPanels className={"p-4 md:p-6"}>
              {/* <TabPanel className={"px-4 md:px-8"}>
                <div className="grid grid-cols-12 py-3 md:py-5 border-b border-b-gray-200">
                  <div className="col-span-3">
                    <h2 className="text-xs md:text-sm text-gray-700 font-semibold">
                      Your photo
                    </h2>
                    <span className="text-xs md:text-sm text-gray-600 font-normal">
                      This will be displayed on your profile.
                    </span>
                  </div>
                  <div className="col-span-6 flex items-center justify-between">
                    <Image
                      src={"/images/arinaProfile.png"}
                      alt=""
                      className="rounded-full md:w-16 h-10 w-10 md:h-16"
                      width={1080}
                      height={1080}
                    />

                    <div className="flex items-center gap-2 md:gap-4">
                      <button className="font-semibold text-red-500 text-xs md:text-sm ">
                        Delete
                      </button>
                      <button className="font-semibold text-gra-600 text-xs md:text-sm ">
                        Update
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                  <div className="col-span-3">
                    <label
                      htmlFor=""
                      className="text-xs md:text-sm text-gray-700 font-semibold"
                    >
                      Full Name
                    </label>
                  </div>
                  <div className="col-span-6">
                    <ThemeInput
                      label=""
                      placeholder=""
                      value="Dr. Arina Baker"
                      onChange={() => {}}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                  <div className="col-span-3">
                    <label
                      htmlFor=""
                      className="text-xs md:text-sm text-gray-700 font-semibold"
                    >
                      Email Address
                    </label>
                  </div>
                  <div className="col-span-6">
                    <ThemeInput
                      label=""
                      placeholder=""
                      value="arina@alphasync.com"
                      onChange={() => {}}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                  <div className="col-span-3">
                    <label
                      htmlFor=""
                      className="text-xs md:text-sm text-gray-700 font-semibold"
                    >
                      Phone Number
                    </label>
                  </div>
                  <div className="col-span-6">
                    <ThemeInput
                      label=""
                      placeholder=""
                      value="(316) 555-0116"
                      onChange={() => {}}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                  <div className="col-span-3">
                    <label
                      htmlFor=""
                      className="text-xs md:text-sm text-gray-700 font-semibold"
                    >
                      Medical License
                    </label>
                  </div>
                  <div className="col-span-6">
                    <ThemeInput
                      label=""
                      placeholder=""
                      value="MD-12345-67890"
                      onChange={() => {}}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 items-center py-3 md:py-6 border-b border-b-gray-200">
                  <div className="col-span-3">
                    <label
                      htmlFor=""
                      className="text-xs md:text-sm text-gray-700 font-semibold"
                    >
                      Specialty
                    </label>
                  </div>
                  <div className="col-span-6">
                    <ThemeInput
                      label=""
                      placeholder=""
                      value="Internal Medicine"
                      onChange={() => {}}
                    />
                  </div>
                </div>

                <div className="flex pt-3 md:pt-6 justify-end">
                  <ThemeButton label="Save Changes" heightClass="h-10" />
                </div>
              </TabPanel>
              <TabPanel className={"grid grid-cols-2 gap-4 md:gap-8"}>
                <div className="flex flex-col gap-2 md:gap-4">
                  <h2 className="text-black font-medium text-sm md:text-lg ">
                    Change Password
                  </h2>

                  <div className="flex flex-col gap-3 md:gap-5">
                    <ThemeInput
                      label="Current Password"
                      type="password"
                      placeholder=""
                      value=""
                      onChange={() => {}}
                    />
                    <ThemeInput
                      label="New Password"
                      type="password"
                      placeholder=""
                      value=""
                      onChange={() => {}}
                      required
                    />

                    <ThemeInput
                      label="Confirm New Password"
                      type="password"
                      placeholder=""
                      value=""
                      onChange={() => {}}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <ThemeButton
                      label="Update Password"
                      onClick={() => {}}
                      heightClass="h-10"
                    />
                  </div>
                </div>
                <div className="p-4 md:p-8 bg-gray-50 rounded-xl border-gray-100 border ">
                  <h2 className="text-black text-sm md:text-lg font-medium">
                    Two-Factor Authentication
                  </h2>

                  <div className="px-3 md:px-6 flex flex-col items-center justify-center gap-1.5 md:gap-3">
                    <SecurityLock />
                    <h2 className="text-gray-900 font-medium text-sm md:text-lg text-center">
                      Enable 2FA
                    </h2>
                    <p className="text-sm md:text-base text-gray-800 text-center">
                      Add an extra layer of security to your account
                    </p>

                    <div className="flex">
                      <ThemeButton
                        variant="outline"
                        label="Configure"
                        onClick={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </TabPanel> */}
              <TabPanel>3</TabPanel>

              <TabPanel className={"flex flex-col gap-2 md:gap-4"}>4</TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
};

export default page;
