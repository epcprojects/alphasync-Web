"use client";

import { Pagination} from "@/app/components";
import {  useQuery } from "@apollo/client/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
    ArrowDownIcon,
  DoctorFilledIcon,
  SearchIcon,
} from "@/icons";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import type { AllProductsResponse } from "@/types/products";

import {  Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import DoctorDatabaseView from "@/app/components/ui/cards/DoctorsDatabaseView";

const Page = () => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
 

  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;
const TEST_DATA = [
    {
      id: 1,
      name: "Alex Rivera",
      contact: "555-0199",
      email: "alex@medflow.com",
      status: "Active",
      speciality: "Cardiology",
      npiNumber: "MD-12345-67890"
    },
    {
      id: 2,
      name: "Jordan Smith",
      contact: "555-0244",
      email: "j.smith@provider.com",
      status: "Inactive",
       speciality: "Cardiology",
      npiNumber: "MD-12345-67890"
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
    }
  );

 

 


  const ShopsStatuses = [
    { label: "All Status", value: "" ,color:"" },
    { label: "Active", value: "Active" ,color:"before:bg-green-500"},
    { label: "Inactive", value: "Inactive" ,color:"before:bg-red-500"},
  ];
  const [status, setStatus] = useState("");

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11">
            <DoctorFilledIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <div className="">
            <h2 className="lg:w-full text-black font-semibold text-base md:text-xl ">
              Doctors
            </h2>
            
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-2 lg:gap-3">
        
          <div className="sm:bg-white rounded-full  flex-col sm:flex-row w-full flex items-center gap-1 md:gap-2 p-0 md:px-2.5 md:py-2 lg:shadow lg:w-fit">
            <div className="flex items-center relative w-full gap-2 p-1 sm:p-0 rounded-full bg-white sm:bg-transparent shadow-table sm:shadow-none">
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
                className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5  text-base md:py-2 focus:bg-white bg-gray-100 w-full md:min-w-56 outline-none focus:ring focus:ring-gray-200 rounded-full"
              />
              <Menu>
              <MenuButton className="inline-flex min-w-30 whitespace-nowrap py-1.5 md:w-fit w-full md:py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-1 md:gap-2 rounded-full  text-xs md:text-sm font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline justify-between data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                  {status || "All Status"} <ArrowDownIcon fill="#717680" />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className={`min-w-32 md:min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
              >
                {ShopsStatuses.map((status) => (
                                  <MenuItem key={status.label}>
                                    <button
                                      onClick={() => {
                                        setStatus(status.value);

                                      }}
                                      className={`flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full ${
                                        status.color ? `before:w-1.5 before:h-1.5 before:flex-shrink-0 before:content-[''] before:rounded-full before:relative before:block ${status.color}` : ""
                                      }`}
                                    >
                                      {status.label}
                                    </button>
                                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>

            </div>

          </div>
        </div>
      </div>

         <div className="space-y-1 ">
              <div className="hidden sm:grid grid-cols-12  gap-4 px-2 py-2.5 text-sm font-medium shadow-table bg-white rounded-xl text-black">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Specialty</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-2">NPI Number</div>
                <div  className="col-span-2">Status</div>
                <div className="col-span-1 text-end">Actions</div>
              </div>
              {TEST_DATA.map((data, index) => (
                <DoctorDatabaseView
                  user={data}
                  key={data.id}
                  onRowClick={
                    ()=>{
                      router.push(`/manager-accounting/${data.id}`)}
   
                    }
                  
                />
              ))}
              <Pagination currentPage={1} totalPages={20} onPageChange={() => {}} />
            </div>
      
    </div>
  );
};

export default Page;
