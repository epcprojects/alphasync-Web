import {
  ChatIcon,
  CrossIcon,
  ReminderIcon,
  ReorderIcon,
  TrashBinIcon,
} from "@/icons";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
  Dialog,
  DialogPanel,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import PackageIcon from "../../../../public/icons/PackageIcon";
import ThemeButton from "./buttons/ThemeButton";
import { useIsMobile } from "@/hooks/useIsMobile";
import Link from "next/link";

export type Notification = {
  id: number;
  title: string;
  from: string;
  product: string;
  date: string;
  status: string;
  read: boolean;
  type: string;
};

interface NotificationsProps {
  notifications: Notification[];
}

export default function Notifications({ notifications }: NotificationsProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const renderList = (limit?: number) => (
    <div className="space-y-3 lg:space-y-4">
      {notifications.slice(0, limit ?? notifications.length).map((n) => (
        <div
          key={n.id}
          className="pb-2.5 lg:pb-4 border-b border-mercury last:border-b-0"
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
                <h2 className="text-xs md:text-base text-gray-800 font-semibold">
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
                    size={isMobile ? "small" : "medium"}
                    variant="outline"
                    className="w-fit"
                    heightClass={isMobile ? "h-8" : "h-9"}
                  />
                  {n.type !== "message" && (
                    <ThemeButton
                      label="Approve"
                      size={isMobile ? "small" : "medium"}
                      variant="success"
                      className="w-fit"
                      heightClass={isMobile ? "h-8" : "h-9"}
                    />
                  )}
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
    </div>
  );

  return (
    <>
      {isMobile ? (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="h-8 w-8 cursor-pointer md:w-11 md:h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <ReminderIcon fill="white" />
          </button>

          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            className="relative z-[99]"
          >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center">
              <DialogPanel className="bg-white w-full relative h-full rounded-none ">
                <div className="px-4 py-3 bg-gray-100 flex sm:rounded-t-2xl items-center justify-between border-b border-gray-200">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-white flex items-center justify-center border border-lightGray">
                      <ReminderIcon height="18" width="18" fill="#374151" />
                    </div>
                    <h2 className="text-lg font-semibold text-black">
                      Notifications
                    </h2>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="md:p-1 p-1 hover:bg-gray-200 rounded-md cursor-pointer"
                  >
                    <CrossIcon />
                  </button>
                </div>
                <div className="overflow-y-auto h-[100dvh]  p-4 pb-16">
                  {renderList()}
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        </>
      ) : (
        <Popover className="relative">
          <PopoverButton className="h-8 w-8 cursor-pointer md:w-11 md:h-11 rounded-full border-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
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
            <PopoverPanel>
              {({ close }) => (
                <div className="absolute px-3 md:min-w-96 py-4 right-0 mt-2 w-96 rounded-xl shadow-lg bg-white">
                  {renderList(3)}

                  {notifications.length > 3 && (
                    <Link
                      href="/notifications"
                      onClick={() => close()}
                      className="w-full mt-2 flex items-center justify-center text-center py-2 bg-blue-100 rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-200 text-primary"
                    >
                      View all
                    </Link>
                  )}
                </div>
              )}
            </PopoverPanel>
          </Transition>
        </Popover>
      )}
    </>
  );
}
