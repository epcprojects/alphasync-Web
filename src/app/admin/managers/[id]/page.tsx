"use client";
import { Pagination } from "@/app/components";
import { useQuery } from "@apollo/client/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  KeyLeftIcon,
} from "@/icons";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import type { AllProductsResponse } from "@/types/products";
import AddEditManagerModal from "@/app/components/ui/modals/AddEditManagerModal";
import { ManagersType } from "@/app/components/ui/cards/ManagersDatabaseView";
import ManagerProfileHeaderCard from "@/app/components/ui/cards/ManagerProfileHeaderCard";
import ManagerDoctorsDatabaseView from "@/app/components/ui/cards/ManagerDoctorsDatabaseView";
import AssignDoctorModal from "@/app/components/ui/modals/AssignDoctorModal";

const Page = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editUser, seteditUser] = useState<ManagersType | null>(null);
 const [showAssignDoctor, setshowAssignDoctor] = useState(false);
  const [showAddEditModal, setshowAddEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { error } = useQuery<AllProductsResponse>(
    ALL_PRODUCTS_INVENTORY,
    {
      variables: {
        search: debouncedSearch || null,
        page: currentPage,
        perPage: itemsPerPage,
        markedUp: true,
      },
      fetchPolicy: "network-only",
    },
  )
const TEST_DATA = [
    {
      id: 1,
      name: "Alex Rivera",
      contact: "555-0199",
      email: "alex@medflow.com",
      status: "Active",
      speciality: "Cardiology",
      npiNumber: "MD123456",
    },
    {
      id: 2,
      name: "Jordan Smith",
      contact: "555-0244",
      email: "j.smith@provider.com",
      status: "Inactive",
      speciality: "Cardiology",
      npiNumber: "MD123456",
    },
  ];
   const router = useRouter();
  if (error) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="bg-white rounded-xl border border-red-200 p-6 md:p-12 text-center text-red-500 text-sm">
          Failed to load managers. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11">
            <KeyLeftIcon
              height={isMobile ? "16" : "24"}
              width={isMobile ? "16" : "24"}
             
            />
          </span>
          <div className="">
            <h2 className="lg:w-full text-black font-semibold text-base md:text-xl ">
             Manager Profile
            </h2>
          </div>
        </div>
         
      </div>
      <div className="bg-white rounded-xl">
            <ManagerProfileHeaderCard name={"John Smitt"} email={"john.smith@email.com"} phone={"(555) 123-4567"} statusActive={true} assignedDoctors={8} 
            onAssignDoctor={
                () => {setshowAssignDoctor(true)}
            } />
      </div>
      <div className="space-y-1 ">
        <div className="hidden sm:grid grid-cols-12 gap-4  px-2 py-2.5 text-sm font-medium shadow-table bg-white rounded-xl text-black">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Speciality</div>
          <div className="col-span-2">Phone</div>
          <div className="col-span-2">NPI Number</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>
        {TEST_DATA.map((data, index) => (
                  <ManagerDoctorsDatabaseView
                user={data}
                key={data.id}
                onRowClick={() => {
                   console.log("Row clicked for user ID:", data.id);
                } } onViewUser={() => {
                   console.log("view user : ", data.id);
                }} onDisableUser={() => {
                   console.log("disable user for ID:", data.id);
                }}        
                  />
                ))}
        <Pagination currentPage={1} totalPages={20} onPageChange={() => {}} />
      </div>
  <AssignDoctorModal 
      isOpen={showAssignDoctor} onClose={
        () => {
          setshowAssignDoctor(false)
        }    
        }
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
