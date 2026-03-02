"use client";
import { PlusIcon } from "@/icons";
import React from "react";
import ThemeButton from "../buttons/ThemeButton";
import ProfileImage from "@/app/components/ui/ProfileImage";

interface ManagerProfileHeaderCardProps {
  name: string;
  email: string;
  phone: string;
  statusActive: boolean;
  assignedDoctors: number | string | undefined;
  onAssignDoctor?: () => void;
  imageUrl?: string | null;
}

const colorPairs = [
  { bg: "bg-red-100", text: "text-red-600" },
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-green-100", text: "text-green-600" },
  { bg: "bg-yellow-100", text: "text-yellow-600" },
  { bg: "bg-purple-100", text: "text-pink-600" },
  { bg: "bg-pink-100", text: "text-pink-600" },
  { bg: "bg-indigo-100", text: "text-indigo-600" },
];

function getColorPair(seed: number | string | undefined) {
  const validSeed = typeof seed === "number" ? seed : Number(seed) || 0;
  const index = Math.abs(validSeed) % colorPairs.length;
  return colorPairs[index] || colorPairs[0];
}

function formatDateOfBirth(dateString?: string): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  } catch {
    return "—";
  }
}

const ManagerProfileHeaderCard: React.FC<ManagerProfileHeaderCardProps> = ({
  name,
  email,
  phone,
  assignedDoctors,
  onAssignDoctor,
  statusActive,
  imageUrl,
}) => {
  // Use email as seed for color pair (convert email to number hash)
  const emailHash = email
    ? email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : 0;
  const { bg, text } = getColorPair(emailHash);
  return (
    <>
      {/* Mobile View */}
      <div className="sm:hidden p-3 flex flex-col gap-2 flex-wrap">
        <div className="flex items-start  gap-1 justify-between">
          <div className="flex items-start gap-2">
            <ProfileImage
              imageUrl={imageUrl}
              fullName={name}
              email={email}
              bg={bg}
              text={text}
            />
            <div className="flex flex-col gap-1 md:gap-2">
              <h2 className="text-slate-900 text-base md:text-xl font-semibold">
                {name}
              </h2>
              <h2 className="text-slate-800 text-sm font-normal">{phone}</h2>
              <h2 className="text-slate-800 text-sm font-normal">{email}</h2>
              <h2 className="text-slate-800 text-sm font-normal">
                Assigned Doctors: {assignedDoctors || 0}
              </h2>
            </div>
          </div>

          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-sm md:text-sm font-medium ${
              statusActive
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            } border `}
          >
            {statusActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center justify-end">
          <ThemeButton
            label="Assign Doctor"
            onClick={onAssignDoctor}
            icon={<PlusIcon />}
            variant="primaryOutline"
            heightClass="h-10"
          />
        </div>
      </div>

      {/* Desktop View */}
      <div className="p-3 md:p-6 relative hidden sm:flex items-start lg:items-center justify-between  gap-3 md:gap-5 ">
        <div className="flex items-start lg:items-center gap-3 md:gap-5">
          <ProfileImage
            imageUrl={imageUrl}
            fullName={name}
            email={email}
            bg={bg}
            text={text}
            width={72}
            height={72}
            className="rounded-full object-cover bg-gray-200 w-[72px] h-[72px]"
            fallbackClassName={`w-[72px] h-[72px] shrink-0 ${bg} ${text} flex items-center font-medium justify-center rounded-full`}
          />
          <div className="flex gap-3 lg:gap-6 justify-between flex-col">
            <div className="flex items-center gap-1 md:gap-2">
              <h2 className="text-slate-900 text-sm md:text-xl font-semibold">
                {name}
              </h2>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-base font-medium ${
                  statusActive
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                } border `}
              >
                {statusActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex items-start flex-wrap ">
              <div className="border-r pe-3 md:pe-5 border-gray-200">
                <h2 className="text-xs md:text-base text-gray-500">Email:</h2>
                <h3 className="text-xs md:text-base text-gray-800 font-medium">
                  {email}
                </h3>
              </div>

              <div className="border-r md:pe-3 lg:px-5 px-3 border-gray-200">
                <h2 className="text-xs md:text-base text-gray-500">Phone:</h2>
                <h3 className="text-xs md:text-base text-gray-800 font-medium">
                  {phone}
                </h3>
              </div>

              <div className=" md:pe-5 lg:px-5 max-w-80 px-3 ">
                <h2 className="text-xs md:text-base text-gray-500">
                  Assigned Doctors
                </h2>
                <h3 className="text-xs md:text-base line-clamp-1 text-gray-800 font-medium">
                  {assignedDoctors || 0}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center absolute top-10 end-6 gap-1.5 md:gap-3">
          <ThemeButton
            label="Assign Doctor"
            onClick={onAssignDoctor}
            icon={<PlusIcon />}
            variant="primaryOutline"
            heightClass="h-10"
          />
        </div>
      </div>
    </>
  );
};

export default ManagerProfileHeaderCard;
