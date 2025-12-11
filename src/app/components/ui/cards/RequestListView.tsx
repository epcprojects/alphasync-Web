"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CheckMarkCircle, CrossIcon, UserFilledIcon } from "@/icons";
import { getInitials } from "@/lib/helpers";
import Tooltip from "../tooltip";

type Request = {
  id: number;
  requestID: string;
  customer: string;
  email: string;
  date: string;
  items: string[];
  amount: number;
  status: string;
  orderPaid?: boolean;
};

type RequestListViewProps = {
  request: Request;
  onProfileBtn: () => void;
  onAcceptBtn?: () => void;
  onRejectBtn?: () => void;
  onChatBtn: () => void;
};

const colorPairs = [
  { bg: "bg-red-100", text: "text-red-600" },
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-green-100", text: "text-green-600" },
  { bg: "bg-yellow-100", text: "text-yellow-600" },
  { bg: "bg-purple-100", text: "text-purple-600" },
  { bg: "bg-pink-100", text: "text-pink-600" },
  { bg: "bg-indigo-100", text: "text-indigo-600" },
];
function getColorPair(seed: number) {
  return colorPairs[seed % colorPairs.length];
}

function getStatusClasses(status: Request["status"]) {
  switch (status) {
    case "Requested":
      return "bg-amber-50 border border-amber-200 text-amber-700";
    case "Approved":
      return "bg-green-50 border border-green-200 text-green-700";
    case "Denied":
      return "bg-red-50 border border-red-200 text-red-700";
    default:
      return "bg-gray-50 border border-gray-200 text-gray-700";
  }
}

function getPaymentStatusClasses(orderPaid: boolean | undefined) {
  if (orderPaid) {
    return "bg-green-50 border border-green-200 text-green-700";
  }
  return "bg-gray-50 border border-gray-200 text-gray-700";
}

export default function RequestListView({
  request: request,
  onProfileBtn,
  onAcceptBtn,
  onRejectBtn,
  onChatBtn,
}: RequestListViewProps) {
  const { bg, text } = getColorPair(request.id);

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="p-2 bg-white rounded-lg  flex flex-col gap-3 shadow-table">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-10 h-10 shrink-0 ${bg} ${text} flex items-center text-sm font-medium justify-center rounded-full`}
            >
              {getInitials(request.customer)}
            </span>
            <div className="flex flex-col">
              <h2 className="text-gray-800 text-sm font-semibold">
                {request.requestID}
              </h2>
              <h2 className="text-gray-800 text-xs font-normal">
                {request.customer}
              </h2>
              <h3 className="text-gray-800 text-xs font-normal">
                {request.email}
              </h3>
            </div>
          </div>
          <div className=" font-medium text-xs md:text-sm ">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xxs md:text-sm font-medium ${getStatusClasses(
                request.status
              )}`}
            >
              {request.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-black font-medium text-xs pe-1">Date:</span>
            <span className="text-gray-800 font-normal text-xs">
              {request.date}
            </span>
          </div>

          <div>
            <span className="text-black font-medium text-xs pe-1">Total:</span>
            <span className="text-gray-800 font-normal text-xs">
              {request.amount}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-black font-medium text-xs pe-1">Items:</span>
            <span className="text-gray-800 font-normal text-xs">
              {request.items}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-black font-medium text-xs pe-1">
              Payment Status:
            </span>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xxs font-medium ${getPaymentStatusClasses(
                request.orderPaid
              )}`}
            >
              {request.orderPaid ? "Paid" : "Unpaid"}
            </span>
          </div>

          <div className=" flex items-center justify-end gap-1">
            {onAcceptBtn &&
              request.status !== "Approved" &&
              request.status !== "Denied" && (
                <Tooltip content="Approve Request">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcceptBtn();
                    }}
                    className="bg-green-500 hover:bg-green-700 cursor-pointer rounded-md md:h-8 md:w-8 h-6 w-6 flex items-center justify-center"
                  >
                    <CheckMarkCircle />
                  </button>
                </Tooltip>
              )}
            {onRejectBtn &&
              request.status !== "Approved" &&
              request.status !== "Denied" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRejectBtn();
                  }}
                  className="bg-red-500 cursor-pointer rounded-md h-6 w-6 flex items-center justify-center"
                >
                  <span className="bg-white rounded-full w-3 h-3 flex items-center justify-center">
                    <CrossIcon fill="red" width="12" height="12" />
                  </span>
                </button>
              )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProfileBtn();
              }}
              className="bg-primary cursor-pointer rounded-md h-6 w-6 flex items-center justify-center"
            >
              <UserFilledIcon width={14} height={14} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onChatBtn();
              }}
              className="flex  md:h-8 md:w-8 h-6 w-6 cursor-pointer bg-blue-500 items-center justify-center rounded-md border  border-blue-500"
            >
              <svg
                width="14s"
                height="14"
                viewBox="0 0 19 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.4375 8.67504C1.4375 4.37879 5.07142 0.9375 9.5 0.9375C13.9286 0.9375 17.5625 4.37879 17.5625 8.67504C17.5625 12.9713 13.9286 16.4126 9.5 16.4126C8.9781 16.4132 8.45776 16.3649 7.94524 16.2687C7.76734 16.2353 7.65432 16.2142 7.57022 16.2027C7.5075 16.1931 7.44448 16.2164 7.42081 16.2293C7.33492 16.2701 7.22051 16.3308 7.04535 16.4239C5.97156 16.995 4.71878 17.1975 3.51047 16.9727C3.31535 16.9365 3.1538 16.8 3.08535 16.6137C3.0169 16.4275 3.05168 16.2189 3.17688 16.0649C3.52773 15.6333 3.76897 15.1135 3.87566 14.5539C3.90453 14.4 3.8392 14.191 3.63838 13.987C2.27729 12.6049 1.4375 10.7358 1.4375 8.67504ZM6.5 8.25C6.08579 8.25 5.75 8.58579 5.75 9C5.75 9.41421 6.08579 9.75 6.5 9.75H6.50673C6.92094 9.75 7.25673 9.41421 7.25673 9C7.25673 8.58579 6.92094 8.25 6.50673 8.25H6.5ZM9.49664 8.25C9.08242 8.25 8.74664 8.58579 8.74664 9C8.74664 9.41421 9.08242 9.75 9.49664 9.75H9.50337C9.91758 9.75 10.2534 9.41421 10.2534 9C10.2534 8.58579 9.91758 8.25 9.50337 8.25H9.49664ZM11.7433 9C11.7433 8.58579 12.0791 8.25 12.4933 8.25H12.5C12.9142 8.25 13.25 8.58579 13.25 9C13.25 9.41421 12.9142 9.75 12.5 9.75H12.4933C12.0791 9.75 11.7433 9.41421 11.7433 9Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      key={request.id}
      className="hidden sm:grid grid-cols-[1fr_14rem_1fr_1fr_160px_120px] lg:grid-cols-[1fr_16rem_1fr_1fr_1fr_1fr_1fr_160px] gap-4 items-center rounded-xl bg-white p-1 md:p-3 shadow-table"
    >
      <div>
        <h2 className="text-gray-800 text-xs md:text-sm font-normal whitespace-nowrap">
          {request.requestID}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`md:w-10 md:h-10 ${bg} ${text} shrink-0 flex items-center font-medium justify-center rounded-full`}
        >
          {getInitials(request.customer)}
        </span>
        <div className="flex flex-col">
          <h2 className="text-gray-800 text-xs md:text-base font-medium">
            {request.customer}
          </h2>
          <h3 className="text-gray-800 text-xs font-normal">{request.email}</h3>
        </div>
      </div>
      <div className="text-xs lg:block hidden md:text-sm font-normal text-gray-600 ">
        {request.date}
      </div>

      <div className="lg:block hidden font-normal text-xs md:text-sm text-gray-800">
        <ul>
          {request.items.map((item, index) => (
            <li key={index} className="line-clamp-1">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xs md:text-sm font-medium text-gray-800 ">
        ${request.amount}
      </div>

      <div className=" font-medium text-xs md:text-sm ">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xxs md:text-sm font-medium ${getStatusClasses(
            request.status
          )}`}
        >
          {request.status}
        </span>
      </div>

      <div className=" font-medium text-xs md:text-sm ">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xxs md:text-sm font-medium ${getPaymentStatusClasses(
            request.orderPaid
          )}`}
        >
          {request.orderPaid ? "Paid" : "Unpaid"}
        </span>
      </div>

      <div className=" flex items-center justify-end gap-2">
        {onAcceptBtn &&
          request.status !== "Approved" &&
          request.status !== "Denied" && (
            <Tooltip content="Approve Request">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAcceptBtn();
                }}
                className="bg-green-500 hover:bg-green-700 cursor-pointer rounded-md md:h-8 md:w-8 h-6 w-6 flex items-center justify-center"
              >
                <CheckMarkCircle />
              </button>
            </Tooltip>
          )}
        {onRejectBtn &&
          request.status !== "Approved" &&
          request.status !== "Denied" && (
            <Tooltip content="Reject Request">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRejectBtn();
                }}
                className="bg-red-500 hover:bg-red-700 cursor-pointer rounded-md md:h-8 md:w-8 h-6 w-6 flex items-center justify-center"
              >
                <span className="bg-white rounded-full w-4 h-4 flex items-center justify-center">
                  <CrossIcon fill="red" width="14" height="14" />
                </span>
              </button>
            </Tooltip>
          )}

        <Tooltip content="View Profile">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProfileBtn();
            }}
            className="bg-primary hover:bg-blue-700 cursor-pointer rounded-md md:h-8 md:w-8 h-6 w-6 flex items-center justify-center"
          >
            <UserFilledIcon />
          </button>
        </Tooltip>

        <Tooltip content="Chat with Customer">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChatBtn();
            }}
            className="flex  md:h-8 md:w-8 h-6 w-6 cursor-pointer bg-blue-500 hover:bg-blue-700 items-center justify-center rounded-md border  border-blue-500"
          >
            <svg
              width="19"
              height="18"
              viewBox="0 0 19 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.4375 8.67504C1.4375 4.37879 5.07142 0.9375 9.5 0.9375C13.9286 0.9375 17.5625 4.37879 17.5625 8.67504C17.5625 12.9713 13.9286 16.4126 9.5 16.4126C8.9781 16.4132 8.45776 16.3649 7.94524 16.2687C7.76734 16.2353 7.65432 16.2142 7.57022 16.2027C7.5075 16.1931 7.44448 16.2164 7.42081 16.2293C7.33492 16.2701 7.22051 16.3308 7.04535 16.4239C5.97156 16.995 4.71878 17.1975 3.51047 16.9727C3.31535 16.9365 3.1538 16.8 3.08535 16.6137C3.0169 16.4275 3.05168 16.2189 3.17688 16.0649C3.52773 15.6333 3.76897 15.1135 3.87566 14.5539C3.90453 14.4 3.8392 14.191 3.63838 13.987C2.27729 12.6049 1.4375 10.7358 1.4375 8.67504ZM6.5 8.25C6.08579 8.25 5.75 8.58579 5.75 9C5.75 9.41421 6.08579 9.75 6.5 9.75H6.50673C6.92094 9.75 7.25673 9.41421 7.25673 9C7.25673 8.58579 6.92094 8.25 6.50673 8.25H6.5ZM9.49664 8.25C9.08242 8.25 8.74664 8.58579 8.74664 9C8.74664 9.41421 9.08242 9.75 9.49664 9.75H9.50337C9.91758 9.75 10.2534 9.41421 10.2534 9C10.2534 8.58579 9.91758 8.25 9.50337 8.25H9.49664ZM11.7433 9C11.7433 8.58579 12.0791 8.25 12.4933 8.25H12.5C12.9142 8.25 13.25 8.58579 13.25 9C13.25 9.41421 12.9142 9.75 12.5 9.75H12.4933C12.0791 9.75 11.7433 9.41421 11.7433 9Z"
                fill="white"
              />
            </svg>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
