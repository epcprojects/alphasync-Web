"use client";

import { Loader, Pagination } from "@/app/components";
import ManagerDoctorsDatabaseView, {
  type Doctor,
} from "@/app/components/ui/cards/ManagerDoctorsDatabaseView";
import ManagerProfileHeaderCard from "@/app/components/ui/cards/ManagerProfileHeaderCard";
import { ManagersType } from "@/app/components/ui/cards/ManagersDatabaseView";
import AddEditManagerModal from "@/app/components/ui/modals/AddEditManagerModal";
import AssignDoctorModal from "@/app/components/ui/modals/AssignDoctorModal";
import { UserAttributes } from "@/lib/graphql/attributes";
import { FETCH_CUSTOMER } from "@/lib/graphql/queries";
import { MODIFY_ACCESSS_USER } from "@/lib/graphql/mutations";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { useMutation, useQuery } from "@apollo/client/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { KeyLeftIcon } from "@/icons";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

interface FetchUserResponse {
  fetchUser: {
    user: UserAttributes;
  };
}

const ITEMS_PER_PAGE = 10;

type AssignedDoctor = NonNullable<UserAttributes["assignedDoctors"]>[number];

function mapAssignedDoctorToRow(d: AssignedDoctor): Doctor {
  const id = d.id ?? "";
  const name =
    d?.fullName ?? (d?.firstName?.trim() ? d.firstName : "—");
  const status =
    d?.status === "ACTIVE"
      ? "Active"
      : d?.status === "INACTIVE"
        ? "Inactive"
        : d?.status ?? "—";

  return {
    id,
    name,
    speciality: d?.specialty?.replace(/_/g, " ") ?? "—",
    contact: d?.phoneNo ?? "—",
    email: d?.email ?? "—",
    npiNumber: d?.npiNumber ?? "—",
    status,
    revokeAccess: d?.revokeAccess ?? false,
    imageUrl: d?.imageUrl
      ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? ""}/${d.imageUrl}`
      : undefined,
  };
}

const Page = () => {
  const isMobile = useIsMobile();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [editUser, seteditUser] = useState<ManagersType | null>(null);
  const [showAssignDoctor, setshowAssignDoctor] = useState(false);
  const [showAddEditModal, setshowAddEditModal] = useState(false);
  const [togglingDoctorId, setTogglingDoctorId] = useState<string | number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const { data, loading, error, refetch } = useQuery<FetchUserResponse>(
    FETCH_CUSTOMER,
    {
      variables: { id: id ?? "" },
      skip: !id,
      fetchPolicy: "network-only",
    }
  );

  const [modifyAccessUser, { loading: toggleLoading }] =
    useMutation(MODIFY_ACCESSS_USER);

  const user = data?.fetchUser?.user;

  const handleToggleAccess = async (doctor: Doctor) => {
    if (doctor?.id == null) return;
    const revokeAccess = !doctor.revokeAccess;
    setTogglingDoctorId(doctor.id);
    try {
      await modifyAccessUser({
        variables: {
          userId: String(doctor.id),
          revokeAccess,
        },
      });
      showSuccessToast(
        revokeAccess ? "Access revoked successfully" : "Access granted successfully"
      );
      refetch();
    } catch (e) {
      console.error("Error toggling doctor access:", e);
      showErrorToast("Failed to update access. Please try again.");
    } finally {
      setTogglingDoctorId(null);
    }
  };

  const doctorsList: Doctor[] = useMemo(
    () => (user?.assignedDoctors ?? []).map(mapAssignedDoctorToRow),
    [user?.assignedDoctors]
  );

  const totalPages = Math.max(1, Math.ceil(doctorsList.length / ITEMS_PER_PAGE));
  const paginatedDoctors = useMemo(
    () =>
      doctorsList.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
      ),
    [doctorsList, currentPage]
  );

  // Clamp to valid page when list changes (e.g. after assign/unassign doctors)
  useEffect(() => {
    if (totalPages > 0 && currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  const managerForModal: ManagersType | null = useMemo(() => {
    if (!user) return null;
    const managerId = user.id ?? id;
    if (managerId == null) return null;
    return {
      id: managerId,
      name: user.fullName ?? "—",
      contact: user.phoneNo ?? "—",
      email: user.email ?? "—",
      status:
        user.status === "ACTIVE"
          ? "Active"
          : user.status === "INACTIVE"
            ? "Inactive"
            : user.status ?? "—",
      assignedDoctors: user.assignedDoctors?.length ?? 0,
      assignedDoctorIds: (user.assignedDoctors ?? []).map((d) => d?.id).filter(Boolean) as (string | number)[],
      imageUrl: user.imageUrl
        ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? ""}/${user.imageUrl}`
        : undefined,
    };
  }, [user, id]);

  if (!id) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <p className="text-gray-600">Invalid manager ID.</p>
        <Link href="/admin/managers" className="text-primary hover:underline">
          Back to Managers
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
          {error?.message ?? "Manager not found."}
        </p>
        <Link href="/admin/managers" className="text-primary hover:underline">
          Back to Managers
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/admin/managers"
            className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11 hover:bg-gray-50"
            aria-label="Back to managers"
          >
            <KeyLeftIcon
              height={isMobile ? "16" : "24"}
              width={isMobile ? "16" : "24"}
            />
          </Link>
          <div>
            <h2 className="lg:w-full text-black font-semibold text-base md:text-xl ">
              Manager Profile
            </h2>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl">
        <ManagerProfileHeaderCard
          name={user.fullName ?? "—"}
          email={user.email ?? "—"}
          phone={user.phoneNo ?? "—"}
          statusActive={user.status?.toUpperCase() === "ACTIVE"}
          assignedDoctors={user.assignedDoctors?.length ?? 0}
          imageUrl={
            user.imageUrl
              ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? ""}/${user.imageUrl}`
              : undefined
          }
          onAssignDoctor={() => setshowAssignDoctor(true)}
        />
      </div>
      <div className="space-y-1 ">
        {doctorsList.length > 0 && (
          <div className="hidden sm:grid grid-cols-12 gap-4  px-2 py-2.5 text-sm font-medium shadow-table bg-white rounded-xl text-black">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Speciality</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">NPI Number</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Access</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
        )}
        {paginatedDoctors.map((data) => (
          <ManagerDoctorsDatabaseView
            user={data}
            key={data.id}
            onRowClick={() => router.push(`/admin/doctors/${data.id}`)}
            onViewUser={() => router.push(`/admin/doctors/${data.id}`)}
            hasAccess={!data.revokeAccess}
            onToggleAccess={() => handleToggleAccess(data)}
            toggleLoading={togglingDoctorId === data.id || toggleLoading}
          />
        ))}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <AssignDoctorModal
        isOpen={showAssignDoctor}
        onClose={() => setshowAssignDoctor(false)}
        initialvalues={managerForModal}
        onConfirm={() => refetch()}
      />
      <AddEditManagerModal
        isOpen={showAddEditModal}
        onClose={() => {
          setshowAddEditModal(false);
          seteditUser(null);
        }}
        initialvalues={editUser}
      />
    </div>
  );
};

export default Page;
