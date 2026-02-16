"use client";

import { Pagination} from "@/app/components";
import {  useQuery } from "@apollo/client/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
    ArrowDownIcon,
  DoctorFilledIcon,
  OrdersFilledIcon,
  OrdersIcon,
  SearchIcon,
} from "@/icons";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import type { AllProductsResponse } from "@/types/products";

import {  Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import DoctorDatabaseView from "@/app/components/ui/cards/DoctorsDatabaseView";
import OrdersDatabaseView from "@/app/components/ui/cards/OrdersDatabaseView";
import { id } from "date-fns/locale";

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
        orderNumber: "ORD-001",
        trackingNumber: "TRK-123456",
        date: "2024-06-01",
        peptide: "Peptide A",
        quantity: "10 mg",
        basePrice: "$100",
        markUp: "20%",
        netProfit: "$20",
        totalAmount: "$120",
        orderedBy: "Dr. Smith",
        status: "Completed",
        email: "alex@medflow.com",
    },
 {
      id: 2,
        name: "Jordan Smith",
        orderNumber: "ORD-002",
        trackingNumber: "TRK-123457",
        date: "2024-06-02",
        peptide: "Peptide B",
        quantity: "10 mg",
        basePrice: "$100",
        markUp: "20%",
        netProfit: "$20",
        totalAmount: "$120",
        orderedBy: "Dr. Smith",
        status: "Pending",
        email: "jordan@medflow.com",
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

 

 


  const Statuses = [
    { label: "All Status", value: "" ,color:"" },
    { label: "Pending", value: "Pending" ,color:"before:bg-amber-700"},
    { label: "Processing", value: "Processing" ,color:"before:bg-blue-700"},
    {label:"Completed", value:"Completed",color:"before:bg-green-700"},
  ];
   const orderByCategories = [
    { label: "All", value: "" ,color:"" },
    { label: "Doctor", value: "Doctor" ,color:""},
    { label: "Customer", value: "Customer" ,color:""},
    {label:"Manager", value:"Manager",color:""},
  ];
  const [status, setStatus] = useState("");
  const [orderBy, setOrderBy] = useState("");

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11">
            <OrdersFilledIcon
              height={isMobile ? "16" : "24"}
              width={isMobile ? "16" : "24"}
            />
          </span>
          <div className="">
            <h2 className="lg:w-full text-black font-semibold text-base md:text-xl ">
             Orders
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
                  {orderBy || "Order By"} <ArrowDownIcon fill="#717680" />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className={`min-w-32 md:min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
              >
                {orderByCategories.map((category) => (
                                  <MenuItem key={category.label}>
                                    <button
                                      onClick={() => {
                                        setOrderBy(category.value);

                                      }}
                                      className={`flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full ${
                                        category.color ? `before:w-1.5 before:h-1.5 before:flex-shrink-0 before:content-[''] before:rounded-full before:relative before:block ${category.color}` : ""
                                      }`}
                                    >
                                      {category.label}
                                    </button>
                                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
              <Menu>
              <MenuButton className="inline-flex min-w-30 whitespace-nowrap py-1.5 md:w-fit w-full md:py-2 px-3 cursor-pointer bg-gray-100 text-gray-700 items-center gap-1 md:gap-2 rounded-full  text-xs md:text-sm font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline justify-between data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
                  {status || "All Status"} <ArrowDownIcon fill="#717680" />
              </MenuButton>

              <MenuItems
                transition
                anchor="bottom end"
                className={`min-w-32 md:min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
              >
                {Statuses.map((status) => (
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
              <div className="hidden sm:grid grid-cols-14  gap-4 px-2 py-2.5 text-xs font-medium shadow-table bg-white rounded-xl text-black">
                <div className="col-span-2">Name</div>
                <div className="col-span-1">Order #</div>
                <div className="col-span-1">Tracking #</div>
                <div className="col-span-1">Date</div>
                <div className="col-span-1">Peptide</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-1">Base Price</div>
                <div className="col-span-1">Mark-Up</div>
                <div className="col-span-1">Net Profit</div>
                <div className="col-span-1">Total</div>
                <div className="col-span-1">Ordered By</div>
                <div  className="col-span-2 text-center">Status</div>
              </div>
              {TEST_DATA.map((data, index) => (
                <OrdersDatabaseView
                  user={data}
                  key={data.id}
                  onRowClick={
                    ()=>{
                     console.log("Row clicked for order id:", data.id);
   
                    }
                }
                  
                />
              ))}
              <Pagination currentPage={1} totalPages={20} onPageChange={() => {}} />
            </div>
      
    </div>
  );
};

export default Page;
