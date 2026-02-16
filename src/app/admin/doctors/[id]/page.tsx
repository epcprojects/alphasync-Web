"use client";

import { Pagination, Skeleton, ThemeButton } from "@/app/components";
import { useQuery } from "@apollo/client/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
    AdminFilledIcon,
  AdminManagersFilledIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  CrossIcon,
  EyeViewIcon,
  FileDownloadIcon,
  KeyLeftIcon,
  NoUserIcon,
  OrganizationFilledIcon,
  PdfIcon,
  PlusIcon,
  SearchIcon,
  TickIcon,
} from "@/icons";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import type { AllProductsResponse } from "@/types/products";
import EmptyResult from "@/app/components/ui/EmptyResult/EmptyResult";
import OrganizationDatabaseView, { OganizationUser } from "@/app/components/ui/cards/OrganizationDatabaseView";
import AddEditUserModal from "@/app/components/ui/modals/AddEditUserModal";
import { Button, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import AddEditManagerModal from "@/app/components/ui/modals/AddEditManagerModal";
import ManagersDatabaseView, { ManagersType } from "@/app/components/ui/cards/ManagersDatabaseView";
import CustomerProfileHeaderCard from "@/app/components/ui/cards/CustomerProfileHeaderCard";
import ManagerProfileHeaderCard from "@/app/components/ui/cards/ManagerProfileHeaderCard";
import DoctorDatabaseView from "@/app/components/ui/cards/DoctorsDatabaseView";
import ManagerDoctorsDatabaseView from "@/app/components/ui/cards/ManagerDoctorsDatabaseView";
import AssignDoctorModal from "@/app/components/ui/modals/AssignDoctorModal";
import DoctorProfileHeaderCard from "@/app/components/ui/cards/DoctorProfileHeaderCard";
import DoctorProfileLicensesCard from "@/app/components/ui/cards/DoctorProfileLicensesCard";

const Page = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editUser, seteditUser] = useState<ManagersType | null>(null);
 const [showAssignDoctor, setshowAssignDoctor] = useState(false);
  
  function handleEdit(user: ManagersType){
     seteditUser(user);
      setshowAddEditModal(true);
  }
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
  );
  const ManagerStatuses = [
      { label: "All Status", value: "", color: "" },
      { label: "Active", value: "Active", color: "before:bg-green-500" },
      { label: "Inactive", value: "Inactive", color: "before:bg-red-500" },
    ];
    const [status, setStatus] = useState("");
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
            Doctor Profile
            </h2>
          </div>
        </div>
         
      </div>
      {/* <CustomerProfileHeaderCard name={""} email={""} phone={""} statusActive={false} totalOrders={undefined} lastOrder={""} dob={""} onCreateOrder={function (): void {
              throw new Error("Function not implemented.");
          } } onQuickChat={function (): void {
              throw new Error("Function not implemented.");
          } } getInitials={function (name: string): string {
              throw new Error("Function not implemented.");
          } }/> */}
          <div className="bg-white rounded-xl">
           
           <DoctorProfileHeaderCard name={"John Smitt"} email={"john.smith@email.com"} phone={"(555) 123-4567"} statusActive={true} speciality={"Cardiology"} npiNumber={"MD123456"} dob={"12/09/2003"} oneditProfile={function (): void {
              throw new Error("Function not implemented.");
          } } ondeleteProfile={function (): void {
              throw new Error("Function not implemented.");
          } }           />

          <div className="p-3 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <p className="text-gray-700 lg:col-span-3 font-semibold">Medical Licenses</p>
                <div className="flex flex-col lg:col-span-9 gap-5">
                    <DoctorProfileLicensesCard deaLicenseText="CS4861375" stateText="California" expirationDateText="14-08-2030" documentName="MD-123456.pdf" documentSize="200 KB" buttonsState="pending" documentFormat="pdf" onApprove={() => console.log("Approved")} onDisapprove={() => console.log("Disapproved")}/>
                         <DoctorProfileLicensesCard deaLicenseText="CS4861375" stateText="California" expirationDateText="14-08-2030" documentName="MD-123456.pdf" documentSize="200 KB" buttonsState="approved" documentFormat="pdf" onApprove={() => console.log("Approved")} onDisapprove={() => console.log("Disapproved")}/>
                       <DoctorProfileLicensesCard deaLicenseText="CS4861375" stateText="California" expirationDateText="14-08-2030" documentName="MD-123456.pdf" documentSize="200 KB" buttonsState="disapproved" documentFormat="pdf" onApprove={() => console.log("Approved")} onDisapprove={() => console.log("Disapproved")}/>
                </div>
            </div>


          </div>

           </div>
      {/* <div className="bg-white rounded-xl">
            <ManagerProfileHeaderCard name={"John Smitt"} email={"john.smith@email.com"} phone={"(555) 123-4567"} statusActive={true} assignedDoctors={8} 
            onAssignDoctor={
                () => {setshowAssignDoctor(true)}
            } />
      </div> */}
      {/* <div className="space-y-1 ">
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
      </div> */}

      {/* <EmptyResult
        title={"No managers added yet."}
        description={
          <p className="font-medium text-lg text-gray-800">
            <Button className="text-primary hover:underline underline-offset-2" onClick={()=>setshowAddEditModal(true)}>
             Create managers 
            </Button>{" "}
            to assign doctors and monitor their orders, shops, and accounting.
          </p>
        }
        buttonLabel="Add Manager"
        buttonOnClick={() => setshowAddEditModal(true)}
        icon={<NoUserIcon />}
      /> */}
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
