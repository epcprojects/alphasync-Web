"use client";
import {
  DisableProfileIcon,
  PencilEditIcon,
  TrashBinIcon,
} from "@/icons";
import Tooltip from "../tooltip";
import { useIsMobile } from "@/hooks/useIsMobile";
import ProfileImage from "@/app/components/ui/ProfileImage";

type User = {
  id: number;
  name: string;
  contact: string;
  email: string;
  status: string;
  imageUrl?: string;
};

type OrganizationDatabaseViewProps = {
  user?: User;
  onRowClick?: () => void;
  onEditUser?: (id: string | number) => void;
  onDisableUser?: (id: string |number ) => void;
   onDeleteUser?: (id: string |number ) => void;
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
    case "Active":
      return "bg-green-50 border border-green-200 text-green-700";
    case "Inactive":
      return "bg-red-50 border border-red-200 text-red-700";
    default:
      return "bg-gray-100 border border-gray-200 text-gray-700";
  }
}


export default function CustomerDatabaseView({
  user,
  onRowClick,
  onEditUser,
  onDisableUser,
  onDeleteUser
}: OrganizationDatabaseViewProps) {
  const id = user?.id;
  const name = user?.name;
  const contact = user?.contact;
  const email = user?.email;
 const status = user?.status;

  const { bg, text } = getColorPair(id);

  const ismobile = useIsMobile();

  if (ismobile)
    return (
      <div
        onClick={onRowClick}
        key={id}
        className="bg-white flex flex-col gap-2 p-2  cursor-pointer  rounded-xl shadow-table"
      >
        <div className="flex items-start flex-col sm:flex-row gap-1 justify-between mb-2">
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
                {contact || "—"}
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

        <div className="flex items-center gap-1 w-full">
          <div className="flex items-center gap-1">
           
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (id) onEditUser;
            }}
            className="flex  md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white group-hover:text-white group-hover:bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            <PencilEditIcon fill="currentColor" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (id) onDisableUser;
            }}
            className="flex  md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white group-hover:text-white group-hover:bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            <DisableProfileIcon fill="currentColor" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (id) onDeleteUser;
            }}
            className="flex  md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white group-hover:text-white group-hover:bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            <TrashBinIcon fill="currentColor" />
          </button>
          </div>
        </div>
      </div>
    );

  return (
    <div
      onClick={onRowClick}
      key={id}
      className="grid cursor-pointer grid-cols-12 hover:bg-gray-100 group gap-4 items-center rounded-xl bg-white p-1 md:p-3 shadow-table"
    >
      <div className="col-span-4 flex items-center gap-3">
        <div className="flex items-center gap-1 md:gap-2">
          <ProfileImage
            imageUrl={user?.imageUrl}
            fullName={user?.name}
            email={user?.email}
            bg={bg}
            text={text}
          />

          <h3 className="font-medium line-clamp-1 text-gray-800 text-sm md:text-base">
            {name || "----"}
          </h3>
        </div>
      </div>

      <div className="col-span-3">
        <span className="text-gray-800 text-sm wrap-break-word md:text-base font-medium">
          {email || "—"}
        </span>
      </div>
      <div className="col-span-2 text-gray-800 wrap-break-word text-sm md:text-base font-normal">
        {contact || "—"}
      </div>

      <div className="col-span-1 font-medium text-sm md:text-base text-gray-800">
        <span
          className={`block rounded-full w-fit px-2.5 capitalize  md:whitespace-nowrap wrap-break-word py-0.5 text-xxs md:text-sm font-medium ${getStatusClasses(
            status,
          )}`}
        >
          {status || "Unknown"}
        </span>
      </div>

      <div className="col-span-2 flex items-center flex-wrap justify-end gap-2">
        
        <Tooltip content="Edit User">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (id) onEditUser;
            }}
            className="flex  md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white group-hover:text-white group-hover:bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            <PencilEditIcon fill="currentColor" />
          </button>
        </Tooltip>
        <Tooltip content="Disable User">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (id) onDisableUser;
            }}
            className="flex  md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white group-hover:text-white group-hover:bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            <DisableProfileIcon fill="currentColor" />
          </button>
        </Tooltip>
        <Tooltip content="Delete User">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (id) onDeleteUser;
            }}
            className="flex  md:h-8 md:w-8 h-7 w-7 hover:bg-gradient-to-r hover:text-white group-hover:text-white group-hover:bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-primary bg-white items-center justify-center rounded-md border cursor-pointer border-primary"
          >
            <TrashBinIcon fill="currentColor" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
