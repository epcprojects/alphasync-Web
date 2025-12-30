"use client";
import { Chat } from "@/app/components";
import React from "react";
import { useQuery } from "@apollo/client/react";
import { FETCH_DOCTOR } from "@/lib/graphql/queries";
import ProfileImage from "@/app/components/ui/ProfileImage";

// Interface for doctor data
interface DoctorData {
  id: string;
  fullName: string;
  specialty: string;
  imageUrl: string;
  email: string;
}

interface FetchDoctorResponse {
  fetchUser: {
    user: {
      doctor: DoctorData;
    };
  };
}
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

const Page = () => {
  // GraphQL query to fetch doctor data
  const { data: doctorData } = useQuery<FetchDoctorResponse>(FETCH_DOCTOR, {
    fetchPolicy: "network-only",
  });

  const doctor = doctorData?.fetchUser?.user?.doctor;

  const handleChatCreated = () => {
    // Chat created successfully
  };
  const { bg, text } = getColorPair(doctor?.id);

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="bg-white w-full rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <div className="p-3 md:p-4 lg:p-6 border-b border-b-gray-200 flex items-center gap-3 md:gap-5">
          <ProfileImage
            imageUrl={doctor?.imageUrl}
            fullName={doctor?.fullName}
            email={doctor?.email}
            bg={bg}
            text={text}
            height={60}
            width={60}
          />
          <div>
            <div className="flex items-center gap-1 md:gap-2">
              <h2 className="text-slate-900 text-sm md:text-lg font-semibold">
                {doctor ? `Dr. ${doctor.fullName}` : "Loading..."}
              </h2>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium bg-green-50 text-green-700 border border-green-200`}
              >
                Active
              </span>
            </div>
            <h2 className="text-xs md:text-sm text-gray-600 font-normal">
              {doctor ? doctor.specialty : "Loading..."}
            </h2>
          </div>
        </div>

        {doctor && (
          <Chat
            participantId={doctor.id}
            participantName={`Dr. ${doctor.fullName}`}
            className="p-1.5 md:p-3"
            templates={[
              "I have a question about my prescription",
              "Can you explain my test results?",
              "I need to schedule a follow-up",
              "I'm experiencing side effects",
            ]}
            onChatCreated={handleChatCreated}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
