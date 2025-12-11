"use client";
import { Chat } from "@/app/components";
import { getInitials } from "@/lib/helpers";
import React from "react";
import { useQuery } from "@apollo/client/react";
import { FETCH_DOCTOR } from "@/lib/graphql/queries";

// Interface for doctor data
interface DoctorData {
  id: string;
  fullName: string;
  specialty: string;
}

interface FetchDoctorResponse {
  fetchUser: {
    user: {
      doctor: DoctorData;
    };
  };
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

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="bg-white w-full rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <div className="p-3 md:p-4 lg:p-6 border-b border-b-gray-200 flex items-center gap-3 md:gap-5">
          <div className="rounded-full h-10 w-10  text-red-600 bg-red-100 text-sm md:text-2xl lg:text-3xl font-medium flex items-center justify-center shrink-0 md:h-14 md:w-14 lg:w-19 lg:h-19">
            {doctor ? getInitials(doctor.fullName) : "..."}
          </div>
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
