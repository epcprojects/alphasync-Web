"use client";
import { ArrowLeftIcon } from "@/icons";
import React from "react";
import ThemeButton from "../buttons/ThemeButton";

interface CustomerInfoCardProps {
  name: string;
  email: string;
  phone: string;
  totalOrders: number | string;
  lastOrder: string;
  address: string;
  onBack?: () => void;
  onViewProfile?: () => void;
  getInitials: (name: string) => string;
}

const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({
  name,
  email,
  phone,
  totalOrders,
  lastOrder,
  address,
  onBack,
  onViewProfile,
  getInitials,
}) => {
  return (
    <>
      {/* Mobile View */}
      <div className="sm:hidden p-3 flex flex-col gap-2 border-b border-gray-200">
        <div className="flex items-start gap-2 justify-between">
          <div className="flex items-start gap-2">
            <div className="rounded-full  h-10 w-10 text-red-600 bg-red-100 text-base md:text-3xl font-medium flex items-center justify-center shrink-0 md:h-18 md:w-18">
              {getInitials(name)}
            </div>
            <div className="flex flex-col gap-1 md:gap-2">
              <h2 className="text-slate-900 text-base md:text-lg font-semibold">
                {name}
              </h2>
              <h2 className="text-slate-800 text-sm font-normal">{phone}</h2>
              <h2 className="text-slate-800 text-sm font-normal">{email}</h2>
            </div>
          </div>

          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="flex rotate-180 md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
            >
              <ArrowLeftIcon width="15" height="15" stroke={"currentColor"} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-black ">Total Orders:</h2>
            <h3 className="text-sm text-gray-800 font-normal">{totalOrders}</h3>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-black ">Last Order:</h2>
            <h3 className="text-sm text-gray-800 font-normal">{lastOrder}</h3>
          </div>
        </div>

        <div className="flex items-start gap-2 w-full">
          <h2 className="text-sm whitespace-nowrap font-medium text-black ">
            Shipping Address:
          </h2>
          <h3 className="text-sm text-gray-800 font-normal">{address}</h3>
        </div>
      </div>

      {/* Desktop View */}
      <div className="p-3 md:p-6 hidden sm:flex items-start lg:items-center justify-between border-b border-gray-200 gap-3 md:gap-5">
        <div className="flex items-start  gap-3 md:gap-5">
          <div className="rounded-full h-10 w-10 text-red-600 bg-red-100 text-3xl font-medium flex items-center justify-center shrink-0 md:h-18 md:w-18">
            {getInitials(name)}
          </div>
          <div className="flex gap-3 lg:gap-6 justify-between flex-col">
            <div className="flex items-center gap-1 md:gap-2">
              <h2 className="text-slate-900 text-sm md:text-lg font-semibold">
                {name}
              </h2>
            </div>

            <div className="flex items-start flex-wrap gap-4">
              <div className="border-r pe-3 md:pe-5 border-gray-200">
                <h2 className="text-sm md:text-base text-gray-500">Email:</h2>
                <h3 className="text-sm md:text-base text-gray-800 font-medium">
                  {email}
                </h3>
              </div>

              <div className="border-r md:pe-3 lg:px-5 px-3 border-gray-200">
                <h2 className="text-sm md:text-base text-gray-500">Phone:</h2>
                <h3 className="text-sm md:text-base text-gray-800 font-medium">
                  {phone}
                </h3>
              </div>

              <div className="border-r md:pe-5 lg:px-5 max-w-80 px-3 border-gray-200">
                <h2 className="text-sm md:text-base text-gray-500">
                  Shipping Address:
                </h2>
                <h3 className="text-sm md:text-base line-clamp-1 text-gray-800 font-medium">
                  {address}
                </h3>
              </div>

              <div className="border-r md:pe-3 lg:px-5 px-3 border-gray-200">
                <h2 className="text-sm md:text-base text-gray-500">
                  Total Orders:
                </h2>
                <h3 className="text-sm md:text-base text-gray-800 font-medium">
                  {totalOrders}
                </h3>
              </div>

              <div className="ps-3 lg:ps-5">
                <h2 className="text-sm md:text-base text-gray-500">
                  Last Order:
                </h2>
                <h3 className="text-sm md:text-base text-gray-800 font-medium">
                  {lastOrder}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {onViewProfile && (
          <ThemeButton
            label="View Profile"
            onClick={onViewProfile}
            heightClass="h-10"
          />
        )}
      </div>
    </>
  );
};

export default CustomerInfoCard;
