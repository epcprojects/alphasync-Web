"use client";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  KeyLeftIcon,
} from "@/icons";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import AddEditManagerModal from "@/app/components/ui/modals/AddEditManagerModal";
import  { ManagersType } from "@/app/components/ui/cards/ManagersDatabaseView";
import AssignDoctorModal from "@/app/components/ui/modals/AssignDoctorModal";
import DoctorProfileHeaderCard from "@/app/components/ui/cards/DoctorProfileHeaderCard";
import DoctorProfileLicensesCard, { itemsArray } from "@/app/components/ui/cards/DoctorProfileLicensesCard";

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

  // const { error } = useQuery<AllProductsResponse>(
  //   ALL_PRODUCTS_INVENTORY,
  //   {
  //     variables: {
  //       search: debouncedSearch || null,
  //       page: currentPage,
  //       perPage: itemsPerPage,
  //       markedUp: true,
  //     },
  //     fetchPolicy: "network-only",
  //   },
  // );
 
  const licenceItemsArray: itemsArray[] = [
    {
      deaLicenseText: "CS4861375",
      stateText: "California",
      expirationDateText: "14-08-2030",
      documentName: "MD-123456.pdf",
      documentSize: "200 KB",
      buttonsState: "pending",
      documentFormat: "pdf",
      onConfirm: () => console.log("Approved"),
      onCancel: () => console.log("Disapproved"),
      ondownload: () => console.log("Downloaded"),
      onView: () => console.log("Viewed"),
    },
    {
      deaLicenseText: "CS4861375",
      stateText: "California",
      expirationDateText: "14-08-2030",
      documentName: "MD-123456.pdf",
      documentSize: "200 KB",
      buttonsState: "approved",
      documentFormat: "pdf",
      onConfirm: () => console.log("Approved"),
      onCancel: () => console.log("Disapproved"),
      ondownload: () => console.log("Downloaded"),
      onView: () => console.log("Viewed"),
    },
    {
      deaLicenseText: "CS4861375",
      stateText: "California",
      expirationDateText: "14-08-2030",
      documentName: "MD-123456.pdf",
      documentSize: "200 KB",
      buttonsState: "disapproved",
      documentFormat: "pdf",
      onConfirm: () => console.log("Approved"),
      onCancel: () => console.log("Disapproved"),
      ondownload: () => console.log("Downloaded"),
      onView: () => console.log("Viewed"),
    },
  ];
  const router = useRouter();
  // if (error) {
  //   return (
  //     <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
  //       <div className="bg-white rounded-xl border border-red-200 p-6 md:p-12 text-center text-red-500 text-sm">
  //         Failed to load managers. Please try again.
  //       </div>
  //     </div>
  //   );
  // }

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
          <div className="bg-white rounded-xl">
           
           <DoctorProfileHeaderCard 
           name={"John Smitt"} 
           email={"john.smith@email.com"} 
           phone={"(555) 123-4567"} 
           statusActive={true} 
           speciality={"Cardiology"} 
           npiNumber={"MD123456"} 
           dob={"12/09/2003"} 
           oneditProfile={()=>console.log("on edit")} ondeleteProfile={()=>console.log("on delete")}           />

          <div className="p-3 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <p className="text-gray-700 lg:col-span-3 font-semibold">Medical Licenses</p>
                <div className="flex flex-col lg:col-span-9 gap-5">
                    {licenceItemsArray.map((item, index) => (
                      <DoctorProfileLicensesCard licenseItemsArray={item} key={index}  />
                    ))}
                </div>
            </div>


          </div>

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
