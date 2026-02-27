"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ThemeButton } from "@/app/components";
import { useQuery } from "@apollo/client/react";
import { FETCH_CUSTOMER } from "@/lib/graphql/queries";
import Loader from "@/app/components/ui/Loader";

interface FetchUserResponse {
  fetchUser: {
    user: {
      id?: string | number;
      fullName?: string;
      email?: string;
      phoneNo?: string;
      specialty?: string;
      clinic?: string;
      npiNumber?: string;
      status?: string;
      invitationStatus?: string;
    };
  };
}

export default function ManagerDoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data, loading, error } = useQuery<FetchUserResponse>(FETCH_CUSTOMER, {
    variables: { id: id ?? "" },
    skip: !id,
    fetchPolicy: "network-only",
  });

  const doctor = data?.fetchUser?.user;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader />
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full mx-auto pt-4">
        <p className="text-red-500">Failed to load doctor.</p>
        <ThemeButton
          label="Back to Doctors"
          onClick={() => router.push("/manager/doctors")}
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full mx-auto pt-4">
      <ThemeButton
        label="Back to Doctors"
        onClick={() => router.push("/manager/doctors")}
        className="mb-6"
      />
      <div className="bg-white rounded-xl shadow-table p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Doctor details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-gray-900">{doctor.fullName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-gray-900">{doctor.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1 text-gray-900">{doctor.phoneNo ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Specialty</dt>
            <dd className="mt-1 text-gray-900">{doctor.specialty ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Clinic</dt>
            <dd className="mt-1 text-gray-900">{doctor.clinic ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">NPI number</dt>
            <dd className="mt-1 text-gray-900">{doctor.npiNumber ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-gray-900">{doctor.status ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Invitation</dt>
            <dd className="mt-1 text-gray-900">{doctor.invitationStatus ?? "—"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
