"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import { KeyLeftIcon } from "@/icons";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { DoctorProfileHeaderCard, Loader } from "@/app/components";
import DoctorProfileLicensesCard, {
  itemsArray,
} from "@/app/components/ui/cards/DoctorProfileLicensesCard";
import { FETCH_CUSTOMER } from "@/lib/graphql/queries";
import {
  APPROVE_DEA_LICENSE,
  REJECT_DEA_LICENSE,
} from "@/lib/graphql/mutations";
import { UserAttributes } from "@/lib/graphql/attributes";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface FetchUserResponse {
  fetchUser: {
    user: UserAttributes;
  };
}

function getDocNameFromUrl(url: string | undefined): string {
  if (!url) return "License document";
  const path = url.split("?")[0];
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return last || "License document";
}

function formatExpirationDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    if (a?.length === 4) return `${b}-${c}-${a}`;
    return `${a}-${b}-${c}`;
  }
  return dateStr;
}

function formatDob(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    if (a?.length === 4) return `${b}/${c}/${a}`;
    return `${a}/${b}/${c}`;
  }
  return dateStr;
}

function mapLicenseStatus(
  status: string | undefined
): "approved" | "disapproved" | "pending" {
  const s = (status ?? "pending").toLowerCase();
  if (s === "approved") return "approved";
  if (s === "rejected") return "disapproved";
  return "pending";
}

export default function ManagerDoctorDetailPage() {
  const isMobile = useIsMobile();
  const params = useParams();
  const id = params?.id as string | undefined;

  const { data, loading, error, refetch } = useQuery<FetchUserResponse>(
    FETCH_CUSTOMER,
    {
      variables: { id: id ?? "" },
      skip: !id,
      fetchPolicy: "network-only",
    }
  );

  const [approveDeaLicense] = useMutation(APPROVE_DEA_LICENSE, {
    onCompleted: () => {
      refetch();
      showSuccessToast("DEA license approved");
    },
    onError: (e) => showErrorToast(e.message),
  });

  const [rejectDeaLicense] = useMutation(REJECT_DEA_LICENSE, {
    onCompleted: () => {
      refetch();
      showSuccessToast("DEA license rejected");
    },
    onError: (e) => showErrorToast(e.message),
  });

  const user = data?.fetchUser?.user;

  const handleApproveLicense = (deaLicenseId: string | number | undefined) => {
    if (deaLicenseId == null) return;
    approveDeaLicense({
      variables: { deaLicenseId: String(deaLicenseId) },
    });
  };

  const handleRejectLicense = (deaLicenseId: string | number | undefined) => {
    if (deaLicenseId == null) return;
    rejectDeaLicense({
      variables: { deaLicenseId: String(deaLicenseId) },
    });
  };

  const licenceItemsArray: itemsArray[] =
    (user?.deaLicenses ?? []).map((lic) => {
      const licenseUrl = lic.licenseUrl
        ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? ""}/${lic.licenseUrl}`
        : undefined;
      return {
        deaLicenseText: lic.deaLicense ?? "—",
        stateText: lic.state ?? "—",
        expirationDateText: formatExpirationDate(lic.expirationDate),
        documentName: getDocNameFromUrl(lic.licenseUrl),
        documentSize: "PDF",
        buttonsState: mapLicenseStatus(lic.status),
        documentFormat: "pdf",
        onConfirm: () => handleApproveLicense(lic.id),
        onCancel: () => handleRejectLicense(lic.id),
        onView: licenseUrl
          ? () => window.open(licenseUrl, "_blank", "noopener,noreferrer")
          : undefined,
        ondownload: licenseUrl
          ? () => {
              const link = document.createElement("a");
              link.href = licenseUrl;
              link.download = getDocNameFromUrl(lic.licenseUrl);
              link.target = "_blank";
              link.rel = "noopener noreferrer";
              link.click();
            }
          : undefined,
      };
    }) ?? [];

  if (!id) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <p className="text-gray-600">Invalid doctor ID.</p>
        <Link href="/manager/doctors" className="text-primary hover:underline">
          Back to Doctors
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto min-h-[200px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <p className="text-red-600">
          {error?.message ?? "Doctor not found."}
        </p>
        <Link href="/manager/doctors" className="text-primary hover:underline">
          Back to Doctors
        </Link>
      </div>
    );
  }

  const specialtyDisplay = user.specialty
    ? user.specialty.replace(/_/g, " ")
    : "—";

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/manager/doctors"
            className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11 hover:bg-gray-50"
            aria-label="Back to doctors"
          >
            <KeyLeftIcon
              height={isMobile ? "16" : "24"}
              width={isMobile ? "16" : "24"}
            />
          </Link>
          <div>
            <h2 className="lg:w-full text-black font-semibold text-base md:text-xl">
              Doctor Profile
            </h2>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl">
        <DoctorProfileHeaderCard
          name={user.fullName ?? "—"}
          email={user.email ?? "—"}
          phone={user.phoneNo ?? "—"}
          statusActive={user.status?.toUpperCase() === "ACTIVE"}
          speciality={specialtyDisplay}
          npiNumber={user.npiNumber ?? "—"}
          dob={formatDob(user.dateOfBirth)}
          imageUrl={
            user.imageUrl
              ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? ""}/${user.imageUrl}`
              : undefined
          }
          oneditProfile={() => {}}
          ondeleteProfile={() => {}}
        />

        <div className="p-3 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <p className="text-gray-700 lg:col-span-3 font-semibold">
              Medical Licenses
            </p>
            <div className="flex flex-col lg:col-span-9 gap-5">
              {licenceItemsArray.length === 0 ? (
                <p className="text-gray-500 text-sm">No DEA licenses on file.</p>
              ) : (
                licenceItemsArray.map((item, index) => (
                  <DoctorProfileLicensesCard
                    licenseItemsArray={item}
                    key={index}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
