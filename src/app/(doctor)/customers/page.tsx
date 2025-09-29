"use client";

import { ArrowLeftIcon, SearchIcon, UserAddIcon, UserGroupIcon } from "@/icons";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { CustomerDatabaseView, ThemeButton } from "@/app/components";
import ReactPaginate from "react-paginate";
import { customers } from "../../../../public/data/customers";
import AddCustomerModal from "@/app/components/ui/modals/AddCustomerModal";
import { showSuccessToast } from "@/lib/toast";

function CustomerContent() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemsPerPage = 10;

  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const filteredCustomer = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  const pageCount = Math.ceil(filteredCustomer.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredCustomer.slice(offset, offset + itemsPerPage);

  useEffect(() => {
    setCurrentPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "0");
    router.replace(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(selected));
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center justify-center text-primary rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <UserGroupIcon />
          </span>
          <h2 className="w-full text-black font-semibold text-lg md:text-3xl">
            Customer Database
          </h2>
        </div>

        <div className="bg-white rounded-full flex items-center gap-1 md:gap-2 p-2 shadow-table w-fit">
          <div className="flex items-center relative">
            <span className="absolute left-3">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-2.5 bg-gray-100 min-w-80 outline-none focus:bg-white focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>
          <ThemeButton
            icon={<UserAddIcon />}
            label="Add New Customer"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-12 gap-4 px-2 py-2.5 text-xs font-medium shadow-table bg-white rounded-xl text-black">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-2">Email</div>
          <div className="col-span-1">Date of Birth </div>
          <div className="col-span-1">Last Order</div>
          <div className="col-span-1">Total Orders</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>
        {currentItems.map((customer) => (
          <CustomerDatabaseView
            onRowClick={() => router.push(`/customers/${customer.id}`)}
            key={customer.id}
            customer={customer}
            onViewCustomer={() => router.push(`/customers/${customer.id}`)}
          />
        ))}
      </div>
      <div className="flex justify-center ">
        {currentItems.length > 0 && (
          <div className="w-full flex items-center justify-center">
            <ReactPaginate
              breakLabel="..."
              nextLabel={
                <span className="flex items-center justify-center h-9 md:w-full md:h-full w-9 select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
                  <span className="hidden md:inline-block">Next</span>
                  <span className="block mb-0.5 rotate-180">
                    <ArrowLeftIcon />
                  </span>
                </span>
              }
              previousLabel={
                <span className="flex items-center  h-9 md:w-full md:h-full w-9 justify-center select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
                  <span className="md:mb-0.5">
                    <ArrowLeftIcon />
                  </span>
                  <span className="hidden md:inline-block">Previous</span>
                </span>
              }
              onPageChange={handlePageChange}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              pageCount={pageCount}
              forcePage={currentPage}
              pageLinkClassName="px-4 py-2 rounded-lg text-gray-600 h-11 w-11 leading-8 text-center hover:bg-gray-100 cursor-pointer  hidden md:block"
              containerClassName="flex items-center relative w-full justify-center gap-2 px-3 md:px-4 py-2 md:py-3  h-12 md:h-full rounded-2xl bg-white shadow-table"
              pageClassName=" rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
              activeClassName="bg-gray-200 text-gray-900 font-medium"
              previousClassName="md:px-4 md:py-2 rounded-full  absolute left-3 md:left-4 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
              nextClassName="md:px-4 md:py-2 rounded-full bg-gray-50  absolute end-3 md:end-4 border text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
              breakClassName="px-3 py-1 font-semibold text-gray-400"
            />

            <h2 className="absolute md:hidden text-gravel font-medium text-sm">
              Page {currentPage + 1} of {pageCount}
            </h2>
          </div>
        )}
      </div>

      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(data) => {
          console.log(data);
          showSuccessToast("Customer created successfully!");
        }}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerContent />
    </Suspense>
  );
}
