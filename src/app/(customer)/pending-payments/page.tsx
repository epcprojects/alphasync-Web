"use client";
import {
  ArrowLeftIcon,
  CommandK,
  DeliveryBoxIcon,
  FavoriteIcon,
  FilterIcon,
  GridViewIcon,
  ListViewIcon,
  SearchIcon,
} from "@/icons";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { products } from "../../../../public/data/products";
import { showSuccessToast } from "@/lib/toast";
import { OrderModal, ProductCard, ProductListView } from "@/app/components";
import ReactPaginate from "react-paginate";
import PrescriptionOrderCard, {
  PrescriptionOrder,
} from "@/app/components/ui/cards/PrescriptionOrderCard";

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

function PendingPayments() {
  const [search, setSearch] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const itemsPerPage = 9;

  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const orders: PrescriptionOrder[] = [
    {
      id: "1",
      orderNumber: "PO-001",
      doctorName: "Dr. Sarah Wilson",
      orderItems: [
        {
          id: "1",
          medicineName: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
          quantity: 2,
          price: 89.99,
        },
        {
          id: "2",
          medicineName: "ARA-290 (16mg) x 1",
          quantity: 1,
          price: 89.99,
        },
      ],
      orderedOn: "8/8/2025",
      totalPrice: 309.97,
      isDueToday: "Due Today",
    },
    {
      id: "2",
      orderNumber: "PO-001",
      doctorName: "Dr. Sarah Wilson",
      orderItems: [
        {
          id: "1",
          medicineName: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
          quantity: 2,
          price: 89.99,
        },
        {
          id: "2",
          medicineName: "ARA-290 (16mg) x 1",
          quantity: 1,
          price: 89.99,
        },
      ],
      orderedOn: "8/8/2025",
      totalPrice: 309.97,
      isDueToday: "Due Today",
    },
    {
      id: "3",
      orderNumber: "PO-001",
      doctorName: "Dr. Sarah Wilson",
      orderItems: [
        {
          id: "1",
          medicineName: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
          quantity: 2,
          price: 89.99,
        },
        {
          id: "2",
          medicineName: "ARA-290 (16mg) x 1",
          quantity: 1,
          price: 89.99,
        },
      ],
      orderedOn: "8/8/2025",
      totalPrice: 309.97,
      isDueToday: "Due by 3 days",
    },
  ];
  const filterOptions: FilterOption[] = [
    { id: "all", label: "All" },
    { id: "due-today", label: "Due Today" },
    { id: "due-tomorrow", label: "Due Tomorrow" },
    { id: "due-three-days", label: "Due in Three Days" },
    { id: "due-week", label: "Due this Week" },
    { id: "due-month", label: "Due this month" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");
    router.replace(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, showFavourites]);

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    setShowFilterDropdown(false);
    console.log("Selected filter:", filterId);
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-8 pt-2 mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <DeliveryBoxIcon />
          </span>
          <h2 className="w-full text-black font-semibold text-lg md:text-3xl">
            Pending Payments
          </h2>
          <div className="px-3 py-1 w-32 rounded-full bg-white border border-utility-indigo-200">
            <p className="text-sm font-medium text-primary whitespace-nowrap">
              3 Pendiing Order
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="bg-white rounded-full flex items-center gap-1 md:gap-2 p-2 shadow-lg w-fit">
            <div className="flex items-center relative">
              <span className="absolute left-2">
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="ps-8 py-2 bg-gray-100 min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
              />
              <span className="absolute right-2">
                <CommandK />
              </span>
            </div>

            <button
              ref={buttonRef}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`w-8 h-8 md:h-11 md:w-11 ${
                showFilterDropdown
                  ? "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white"
                  : "bg-gray-100"
              } cursor-pointer rounded-full flex items-center justify-center`}
            >
              <FilterIcon />
            </button>
          </div>
          {showFilterDropdown && (
            <div
              ref={dropdownRef}
              className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-52 py-2 z-50"
              style={{
                filter: "drop-shadow(0 10px 25px rgba(0, 0, 0, 0.1))",
              }}
            >
              {filterOptions.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleFilterSelect(option.id)}
                  className={`w-full text-sm text-left px-6 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                    selectedFilter === option.id
                      ? "bg-gray-100 text-gray-950"
                      : "text-gray-700"
                  } ${index === 0 ? "font-normal text-gray-900" : "font-normal text-gray-500"}`}
                >
                  <span className="block">
                    {option.label}
                    {option.count && (
                      <span className="text-gray-400 ml-2">
                        ({option.count})
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 md:gap-4">
        <PrescriptionOrderCard orders={orders} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingPayments />
    </Suspense>
  );
}
