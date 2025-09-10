import { ChatIcon, ReminderIcon, ReorderIcon, TrashBinIcon } from "@/icons";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { Fragment } from "react";
import PackageIcon from "../../../../public/icons/PackageIcon";
import ThemeButton from "./buttons/ThemeButton";

export default function Notifications() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type notiType = "reorder" | "message" | "request";

  const notifications = [
    {
      id: 1,
      title: "Reorder Request Received",
      from: "Daniel Baker",
      product: "Semaglutide",
      date: "8/22/2025",
      status: "success",
      read: false,
      type: "reorder",
    },
    {
      id: 2,
      title: "New Message from Your Dainel",
      from: "Oliver Thompson",
      product: "Semaglutide",
      date: "8/22/2025",
      status: "info",
      read: false,
      type: "message",
    },
    {
      id: 3,
      title: "Request for a New Product",
      from: "Oliver Thompson",
      product: "2X Blend Tesamorelin (5mg) / Ipamorelin (5mg)",
      date: "8/22/2025",
      status: "warning",
      read: true,
      type: "request",
    },
  ];

  return (
    <Popover className="relative">
      <PopoverButton className="h-8 w-8 cursor-pointer md:w-11 md:h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <ReminderIcon fill="white" />
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className="absolute right-0 mt-2 w-96 rounded-xl shadow-lg bg-white">
          <div className="px-3 py-4 md:min-w-96 space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="  pb-2.5 border-b border-mercury last:!border-b-0"
              >
                <div className="flex items-start gap-2 justify-between">
                  <div className="flex items-start gap-2">
                    <div>
                      {n.type === "reorder" ? (
                        <ReorderIcon />
                      ) : n.type === "message" ? (
                        <ChatIcon />
                      ) : (
                        <PackageIcon />
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <h2 className="text-xs md:text-sm text-gray-800 font-semibold">
                        {n.title}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium md:text-xs text-[10px]">
                          {n.date}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 block"></span>
                        <span className="text-gray-800 font-medium md:text-xs text-[10px]">
                          {n.from}
                        </span>
                      </div>

                      <h2 className="text-xs md:text-sm text-gray-800">
                        {n.type === "reorder" ? (
                          <div>
                            A reorder request for “{n.product}” has been
                            received by
                            <span className="font-semibold"> {n.from}</span>.
                          </div>
                        ) : n.type === "message" ? (
                          <div>
                            <span>{n.from} </span>has sent you a message
                            regarding his reorder request for
                            <span className="font-semibold">
                              {" "}
                              “{n.product}”
                            </span>
                            .
                          </div>
                        ) : (
                          <div>
                            <span>{n.from} </span>has sent you a message
                            regarding his reorder request for
                            <span className="font-semibold">
                              {" "}
                              “{n.product}”
                            </span>
                            .
                          </div>
                        )}
                      </h2>

                      <div className="mt-2 flex items-center gap-2">
                        <ThemeButton
                          label="View Details"
                          size="small"
                          variant="outline"
                          className="w-fit"
                        />

                        <ThemeButton
                          label="Approve"
                          size="small"
                          variant="success"
                          className="w-fit"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary block"></span>
                    )}
                    <button className="cursor-pointer bg-white rounded p-1 hover:bg-red-100">
                      <TrashBinIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 text-center py-2 bg-blue-100 rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-200 text-primary ">
              View all
            </button>
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
