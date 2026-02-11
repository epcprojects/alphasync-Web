"use client";

import { Pagination, Skeleton, ThemeButton } from "@/app/components";
import { useQuery } from "@apollo/client/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  NoUserIcon,
  OrganizationFilledIcon,
  PlusIcon,
  SearchIcon,
} from "@/icons";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import type { AllProductsResponse } from "@/types/products";
import EmptyResult from "@/app/components/ui/EmptyResult/EmptyResult";
import OrganizationDatabaseView, { OganizationUser } from "@/app/components/ui/cards/OrganizationDatabaseView";
import Link from "next/link";
import AddEditUserModal from "@/app/components/ui/modals/AddEditUserModal";
import { Button } from "@headlessui/react";

const Page = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editUser, seteditUser] = useState<OganizationUser | null>(null);

  
  function handleEdit(user: OganizationUser){
     seteditUser(user);
      setshowAddEditModal(true);
  }
  const [showAddEditModal, setshowAddEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const TEST_DATA = [
    {
      id: 1,
      name: "Alex Rivera",
      contact: "555-0199",
      email: "alex@medflow.com",
      status: "Active",
    },
    {
      id: 2,
      name: "Jordan Smith",
      contact: "555-0244",
      email: "j.smith@provider.com",
      status: "Inactive",
    },
  ];
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refetch } = useQuery<AllProductsResponse>(
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

  if (error) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="bg-white rounded-xl border border-red-200 p-6 md:p-12 text-center text-red-500 text-sm">
          Failed to load shop products. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11">
            <OrganizationFilledIcon
              height={isMobile ? "16" : "24"}
              width={isMobile ? "16" : "24"}
            />
          </span>
          <div className="">
            <h2 className="lg:w-full text-black font-semibold text-base md:text-xl ">
              Organization Users
            </h2>
            <p className="text-sm sm:text-base">
              Add and manage nurses or staff who can place orders and access the
              system.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-2 lg:gap-3">
          <div className="sm:bg-white rounded-full flex-col sm:flex-row w-full flex items-center gap-1 md:gap-2 p-0 md:px-2.5 md:py-2 lg:shadow lg:w-fit">
            <div className="flex items-center gap-2 relative w-full p-1 sm:p-0 rounded-full bg-white sm:bg-transparent shadow-table sm:shadow-none">
              <span className="absolute left-3">
                <SearchIcon
                  height={isMobile ? "16" : "20"}
                  width={isMobile ? "16" : "20"}
                />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="ps-8  md:ps-10 pe-3 md:pe-4 py-1.5 text-base md:py-2 focus:bg-white bg-gray-100 w-full md:min-w-56 outline-none focus:ring focus:ring-gray-200 rounded-full"
              />
              <ThemeButton
                label="Add User"
                icon={<PlusIcon />}
                onClick={() => setshowAddEditModal(true)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-1 ">
        <div className="hidden sm:grid grid-cols-12 gap-4  px-2 py-2.5 text-sm font-medium shadow-table bg-white rounded-xl text-black">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Phone</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>
        {TEST_DATA.map((data, index) => (
          <OrganizationDatabaseView
            key={index}
            user={data}
            onEditUser={() => handleEdit(data)
            }
            onDisableUser={() => console.log("Disable User")}
            onDeleteUser={() => console.log("Delete User")}
          />
        ))}
        <Pagination currentPage={1} totalPages={20} onPageChange={() => {}} />
      </div>

      <EmptyResult
        title={"No users added yet."}
        description={
          <p className="font-medium text-lg text-gray-800">
            Click{" "}
            <Button className="text-primary hover:underline underline-offset-2" onClick={()=>setshowAddEditModal(true)}>
              ‘Add User’
            </Button>{" "}
            to invite team members to your organization.
          </p>
        }
        buttonLabel="Add User"
        buttonOnClick={() => setshowAddEditModal(true)}
        icon={<NoUserIcon />}
      />

      <AddEditUserModal
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
