"use client";
import { ThemeButton } from "@/app/components";
import Tooltip from "@/app/components/ui/tooltip";
import {
  ChatIcon,
  PackageIcon,
  ReorderIcon,
  TickDouble,
  TrashBinIcon,
} from "@/icons";
import { showErrorToast } from "@/lib/toast";
import React from "react";
import { notifications } from "../../../../public/data/notifications";

const page = () => {
  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-2 pt-2 mx-auto">
      <div className="flex justify-end">
        <button className="flex items-center gap-1 hover:bg-white cursor-pointer rounded-lg px-3 py-2.5">
          <TickDouble /> Mark All as read
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-table">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="p-3 border-b border-mercury last:border-b-0 md:p-5 flex items-start gap-3 justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {n.type === "reorder" ? (
                  <ReorderIcon />
                ) : n.type === "message" ? (
                  <ChatIcon />
                ) : (
                  <PackageIcon />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h2 className="text-sm md:text-lg text-gray-800 font-semibold">
                    {n.title}
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-gray-300 block"></span>
                  <span className="text-gray-700 font-medium md:text-sm text-xs">
                    {n.date}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-gray-300 block"></span>
                  <span className="text-gray-800 font-normal md:text-sm text-xs">
                    {n.from}
                  </span>
                </div>

                <h2 className="text-xs md:text-sm text-gray-800">
                  {n.type === "reorder" ? (
                    <div>
                      A reorder request for “{n.product}” has been received by
                      <span className="font-semibold"> {n.from}</span>.
                    </div>
                  ) : n.type === "message" ? (
                    <div>
                      <span>{n.from} </span>has sent you a message regarding his
                      reorder request for
                      <span className="font-semibold"> “{n.product}”</span>.
                    </div>
                  ) : (
                    <div>
                      <span>{n.from} </span>has requested a new product
                      <span className="font-semibold"> “{n.product}”</span>.
                    </div>
                  )}
                </h2>

                <div className="mt-2 flex items-center gap-2">
                  <ThemeButton
                    label="View Details"
                    size="medium"
                    variant="outline"
                    className="w-fit"
                    heightClass="h-9"
                  />
                  {n.type !== "message" && (
                    <ThemeButton
                      label="Approve"
                      size="medium"
                      variant="success"
                      className="w-fit"
                      heightClass="h-9"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {n.read && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary block"></span>
              )}

              <Tooltip content="Delete">
                <button
                  onClick={() =>
                    showErrorToast("Notification Deleted Successfully")
                  }
                  className="cursor-pointer bg-white rounded p-1 hover:bg-red-100"
                >
                  <TrashBinIcon />
                </button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
