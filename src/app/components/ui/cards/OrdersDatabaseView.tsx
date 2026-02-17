"use client";
import {
    ArrowLeftIcon,
} from "@/icons";
import Tooltip from "../tooltip";
import { useIsMobile } from "@/hooks/useIsMobile";
import ProfileImage from "@/app/components/ui/ProfileImage";

export type Order = {
  id: number;
  name: string;
  orderNumber: string;
  trackingNumber: string;
  date: string;
  peptide: string;
  quantity: string;
  basePrice: string;
  markUp: string;
  netProfit: string;
  totalAmount: string;
  orderedBy: string;
  status: string;
  email: string;
  imageUrl?: string;
};

type OrdersDatabaseViewProps = {
  user?: Order;
 onRowClick: ()=>void;
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

function getColorPair(seed: number | string | undefined) {
  const validSeed = typeof seed === "number" ? seed : Number(seed) || 0;
  const index = Math.abs(validSeed) % colorPairs.length;
  return colorPairs[index] || colorPairs[0];
}

function getStatusClasses(status?: string) {
  switch (status) {
    case "Pending":
      return "bg-amber-50 border border-amber-200 text-amber-700";
    case "Processing":
      return "bg-blue-50 border border-blue-200 text-blue-700";
    case "Completed":
      return "bg-green-50 border border-green-200 text-green-700";
    default:
      return "bg-gray-100 border border-gray-200 text-gray-700";
  }
}
function getorderByClasses(orderBy?: string) {
  switch (orderBy) {
    default:
      return "bg-gray-100 border border-gray-200 text-gray-700";
  }
}


export default function OrdersDatabaseView({
  user,
    onRowClick
}: OrdersDatabaseViewProps) {
  const id = user?.id;
  const name = user?.name;
  const email = user?.email;
 const status = user?.status;
 const orderNumber = user?.orderNumber;
 const trackingNumber = user?.trackingNumber;
 const date = user?.date;
    const peptide = user?.peptide;
    const quantity = user?.quantity;
    const basePrice = user?.basePrice;
    const markUp = user?.markUp;
    const netProfit = user?.netProfit;
    const totalAmount = user?.totalAmount;
    const orderedBy = user?.orderedBy;

  const { bg, text } = getColorPair(id);

  const ismobile = useIsMobile();

  if (ismobile)
    return (
      <div
        key={id}
        className="bg-white flex flex-col gap-2 p-2  cursor-pointer  rounded-xl shadow-table"
      >
        <div className="flex items-start flex-row gap-1 justify-between mb-2">
          <div className="flex items-start gap-2 ">
            <ProfileImage
              imageUrl={user?.imageUrl}
              fullName={user?.name}
              email={user?.email}
              bg={bg}
              text={text}
            />
            <div className="flex flex-col gap-1">
              <h2 className="text-gray-800 text-sm  md:text-base font-semibold">
                {name || "----"}
              </h2>
              <h2 className="text-gray-800 text-sm md:text-sm font-normal">
                {email || "—"}
              </h2>
            </div>
          </div>
          <div className=" font-medium text-xs md:text-sm text-gray-800">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs capitalize md:text-sm font-medium whitespace-nowrap ${getStatusClasses(
                status,
              )}`}
            >
              {status || "Unknown"}
            </span>
          </div>
        </div>

        <div className="flex justify-between  items-center  gap-1 w-full">
          <div className="flex flex-col gap-1">
      <div className=" text-gray-800 wrap-break-word text-sm md:text-base font-normal">
        {orderNumber || "—"}
      </div>
       <div className=" text-gray-800 wrap-break-word text-sm md:text-base font-normal">
        {trackingNumber || "—"}
      </div>
       <div className=" text-gray-800 wrap-break-word text-sm md:text-base font-normal">
        {date || "—"}
      </div>
       <div className=" text-gray-800 wrap-break-word text-sm md:text-base font-normal">
        {peptide || "—"}
      </div>
       <div className=" text-gray-800 wrap-break-word text-sm md:text-base font-normal">
        {quantity || "—"}
      </div>
       <div className=" text-gray-800 wrap-break-word text-sm md:text-base font-normal">
        {basePrice || "—"}
      </div>
       <div className=" text-primary wrap-break-word text-sm md:text-base font-normal">
        {markUp || "—"}
      </div>
       <div className=" text-green-600 wrap-break-word text-sm md:text-base font-normal">
        {netProfit || "—"}
      </div>
       <div className=" text-gray-800 wrap-break-word text-sm md:text-base font-normal">
        {totalAmount || "—"}
      </div>

          </div>
          <div className="col-span-1 font-medium text-sm  text-gray-800">
        <span
          className={`block rounded-full w-fit px-2.5 capitalize  md:whitespace-nowrap wrap-break-word py-0.5 text-xxs md:text-sm font-medium ${getorderByClasses(
            orderedBy,
          )}`}
        >
          {orderedBy || "Unknown"}
        </span>
      </div>
        </div>
      </div>
    );

  return (
    <div
      key={id}
      onClick={onRowClick}
      className="grid cursor-pointer grid-cols-14 hover:bg-gray-100 items-center gap-4 rounded-xl bg-white p-1 md:p-3 shadow-table"
    >
      <div className="col-span-2 flex items-center gap-3">
        <div className="flex items-center gap-1 md:gap-2">
          <ProfileImage
            imageUrl={user?.imageUrl}
            fullName={user?.name}
            email={user?.email}
            bg={bg}
            text={text}
          />
           <div className="flex flex-col">
          <h3 className="font-medium line-clamp-1 text-gray-800 text-sm md:text-base">
            {name || "----"}
          </h3>
          <h3 className="font-medium line-clamp-1 text-gray-800 text-sm md:text-xs">
            {email || "----"}
          </h3>
          </div>
        </div>
      </div>

      <div className="col-span-1">
        <span className="text-gray-800 text-sm wrap-break-word  font-medium">
          {orderNumber || "—"}
        </span>
      </div>
      <div className="col-span-1 text-gray-800 wrap-break-word text-sm font-normal">
        {trackingNumber || "—"}
      </div>
       <div className="col-span-1 text-gray-800 wrap-break-word text-sm font-normal">
        {date || "—"}
      </div>
       <div className="col-span-1 text-gray-800 wrap-break-word text-sm  font-normal">
        {peptide || "—"}
      </div>
       <div className="col-span-1 text-gray-800 wrap-break-word text-sm  font-normal">
        {quantity || "—"}
      </div>
       <div className="col-span-1 text-gray-800 wrap-break-word text-sm  font-normal">
        {basePrice || "—"}
      </div>
       <div className="col-span-1 text-primary wrap-break-word text-sm  font-normal">
        {markUp || "—"}
      </div>
       <div className="col-span-1 text-green-600 wrap-break-word text-sm  font-normal">
        {netProfit || "—"}
      </div>
       <div className="col-span-1 text-gray-800 wrap-break-word text-sm  font-normal">
        {totalAmount || "—"}
      </div>
      <div className="col-span-1 font-medium text-sm  text-gray-800">
        <span
          className={`block rounded-full w-fit px-2.5 capitalize  md:whitespace-nowrap wrap-break-word py-0.5 text-xxs md:text-sm font-medium ${getorderByClasses(
            orderedBy,
          )}`}
        >
          {orderedBy || "Unknown"}
        </span>
      </div>
      <div className="col-span-2 flex justify-center font-medium text-sm  text-gray-800">
        <span
          className={`block rounded-full  w-fit px-2.5 capitalize  md:whitespace-nowrap wrap-break-word py-0.5 text-xxs md:text-sm font-medium ${getStatusClasses(
            status,
          )}`}
        >
          {status || "Unknown"}
        </span>
      </div>

      
    </div>
  );
}
