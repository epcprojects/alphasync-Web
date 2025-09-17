"use client";
import { ThemeButton } from "@/app/components";
import { getStatusClasses } from "@/app/components/ui/cards/OrderListView";
import {
  ArrowDownIcon,
  CrossIcon,
  DeliveryTruckIcon,
  LocationIcon,
  MessageOutgoingIcon,
  PrinterIcon,
  ShipmentTrackingIcon,
} from "@/icons";
import { getInitials } from "@/lib/helpers";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const Page = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-8 pt-2 mx-auto">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={router.back}
          className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
        >
          <ArrowDownIcon />
        </button>
        <h2 className="text-black font-semibold text-lg md:text-3xl">
          Order {params.id}
        </h2>
      </div>

      <div className="w-full bg-white rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <div>
          <div className="p-3 md:p-6 flex items-center justify-between border-b border-gray-200 gap-3 md:gap-5">
            <div className="flex items-center gap-3 md:gap-5">
              <div className="rounded-full h-10 w-10 text-red-500 bg-red-100 text-3xl font-medium flex items-center justify-center shrink-0 md:h-19 md:w-19">
                {getInitials("John Smith")}
                {/* <Image
                      alt=""
                      width={256}
                      height={256}
                      src={"/images/arinaProfile.png"}
                      className="rounded-full w-full h-full"
                    /> */}
              </div>
              <div className="flex gap-3 md:gap-6 justify-between flex-col ">
                <div className="flex items-center gap-1 md:gap-2">
                  <h2 className="text-slate-900 text-sm md:text-lg font-semibold">
                    John Smith
                  </h2>
                </div>

                <div className="flex items-center">
                  <div className="border-r pe-3 md:pe-5 h border-gray-200">
                    <h2 className="text-xs md:text-sm text-gray-500 ">
                      Email:
                    </h2>
                    <h3 className="text-xs md:text-sm text-gray-800 font-medium">
                      john.smith@email.com
                    </h3>
                  </div>

                  <div className="border-r px-3 md:px-5 h border-gray-200">
                    <h2 className="text-xs md:text-sm text-gray-500 ">
                      Phone:
                    </h2>
                    <h3 className="text-xs md:text-sm text-gray-800 font-medium">
                      (555) 123-4567
                    </h3>
                  </div>

                  <div className="border-r px-3 md:px-5 max-w-80 border-gray-200">
                    <h2 className="text-xs md:text-sm text-gray-500 ">
                      Shipping Address:
                    </h2>
                    <h3 className="text-xs md:text-sm line-clamp-1 text-gray-800 font-medium">
                      321 Elm St, Nowhere, ST 98765
                    </h3>
                  </div>

                  <div className="border-r px-3 md:px-5 h border-gray-200">
                    <h2 className="text-xs md:text-sm text-gray-500 ">
                      Total Orders:
                    </h2>
                    <h3 className="text-xs md:text-sm text-gray-800 font-medium">
                      08
                    </h3>
                  </div>

                  <div className=" ps-3 md:ps-5">
                    <h2 className="text-xs md:text-sm text-gray-500 ">
                      Last Order:
                    </h2>
                    <h3 className="text-xs md:text-sm text-gray-800 font-medium">
                      1/15/2024
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <ThemeButton
              label="View Profile"
              onClick={() => {}}
              heightClass="h-10"
            />
          </div>
          <div className="p-3 md:p-6 flex flex-col gap-1.5 md:gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                <h2 className="text-sm md:text-lg font-semibold text-black">
                  Order {params.id}
                </h2>
                <span className="text-gray-700 font-medium text-xs md:text-sm py-0.5 px-2.5 rounded-full bg-gray-100 border border-gray-200">
                  1/12/2024
                </span>
              </div>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium ${getStatusClasses(
                  "Processing"
                )}`}
              >
                Processing
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="grid grid-cols-4 text-xs font-medium text-black rounded-xl bg-gray-50 p-1.5 md:p-3">
                <div>Product</div>
                <div>Quantity</div>
                <div>Unit Price</div>
                <div>Total</div>
              </div>
              <div className="grid grid-cols-4 rounded-xl bg-gray-50 p-1.5 md:py-2 md:px-3">
                <div className="text-gray-800 text-xs md:text-sm">CJC-1295</div>
                <div>
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200">
                    1
                  </span>
                </div>
                <div className="text-gray-800 text-xs md:text-sm font-normal">
                  $95.25
                </div>
                <div className="text-gray-800 text-xs md:text-sm font-medium">
                  $95.25
                </div>
              </div>

              <div className="grid grid-cols-4 rounded-xl bg-gray-50 p-1.5 md:py-2 md:px-3">
                <div className="text-gray-800 text-xs md:text-sm">
                  Sermorelin
                </div>
                <div>
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200">
                    2
                  </span>
                </div>
                <div className="text-gray-800 text-xs md:text-sm font-normal">
                  $112.50
                </div>
                <div className="text-gray-800 text-xs md:text-sm font-medium">
                  $222.5
                </div>
              </div>

              <div className="grid grid-cols-4 bg-sky-50 p-1.5 md:py-2 md:px-3 rounded-xl">
                <div className="col-span-3 text-gray-800 font-semibold text-sm md:text-lg">
                  Order Total
                </div>
                <div className="text-sm md:text-lg font-semibold text-primary">
                  $307.75
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-6 !pt-0 flex flex-col gap-1.5 md:gap-3">
          <h2 className="font-semibold text-sm md:text-lg text-black ">
            Shipping Information
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg flex items-center gap-1 md:gap-2 p-2 bg-gray-50 ">
              <div className="rounded-lg bg-white border border-gray-200 flex items-center justify-center w-10 h-10">
                <DeliveryTruckIcon />
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="font-medium text-xs text-gray-500 ">
                  Tracking Number:
                </h2>
                <h3 className="text-xs md:text-sm text-gray-800">
                  TRK123456789
                </h3>
              </div>
            </div>
            <div className="rounded-lg flex items-center gap-1 md:gap-2 p-2 bg-gray-50 ">
              <div className="rounded-lg bg-white border border-gray-200 flex items-center justify-center w-10 h-10">
                <LocationIcon />
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="font-medium text-xs text-gray-500 ">
                  Shipping Address:
                </h2>
                <h3 className="text-xs md:text-sm text-gray-800">
                  321 Elm St, Nowhere, ST 98765
                </h3>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-1.5 md:gap-3">
            <ThemeButton
              label="Cancel Order"
              variant="outline"
              size="medium"
              icon={<CrossIcon fill="#EF4444" />}
              onClick={() => {}}
            />

            <ThemeButton
              label="Track Package"
              variant="outline"
              size="medium"
              icon={<ShipmentTrackingIcon />}
              onClick={() => {}}
            />

            <ThemeButton
              label="Print Invoice"
              variant="outline"
              size="medium"
              icon={<PrinterIcon />}
              onClick={() => {}}
            />

            <ThemeButton
              label="Send Update to Customer"
              variant="outline"
              size="medium"
              icon={<MessageOutgoingIcon />}
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
