"use client";

import { ArrowLeftIcon, ReminderFilledIcon, SearchIcon } from "@/icons";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { reminders } from "../../../../public/data/reminders";
import ReactPaginate from "react-paginate";
import RefillView from "@/app/components/ui/cards/RefillView";

function ReminderContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();

  const itemsPerPage = 9;
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const filteredProducts = reminders.filter((p) => {
    const matchesSearch =
      p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.product.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredProducts.slice(offset, offset + itemsPerPage);

  useEffect(() => {
    setCurrentPage(0);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.replace(`?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(selected + 1));
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <ReminderFilledIcon />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Customers Due for Refills
          </h2>
        </div>

        <div className="bg-white rounded-full flex items-center gap-1 md:gap-2 p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)] w-fit">
          <div className="flex items-center relative">
            <span className="absolute left-3">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-2 bg-gray-100 min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_400px] text-black font-medium text-xs gap-4 px-2 py-2.5 bg-white rounded-xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]">
            <div>
              <h2>Customer</h2>
            </div>
            <div>
              <h2>Product</h2>
            </div>
            <div>
              <h2>Last Order</h2>
            </div>
            <div>
              <h2>Days Since</h2>
            </div>
            <div className="flex  items-center justify-center">
              <h2 className="text-center">Actions</h2>
            </div>
          </div>

          {currentItems.map((order) => (
            <RefillView
              onRowClick={() => router.push(`/orders/${order.id}`)}
              key={order.id}
              order={order}
              onAutoReOrderClick={() => {}}
              onContactClick={() => {}}
              onReOrderClick={() => {}}
            />
          ))}
        </div>
        <div className="flex justify-center ">
          {currentItems.length > 0 && (
            <ReactPaginate
              breakLabel="..."
              nextLabel={
                <span className="flex items-center select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
                  Next
                  <span className="block mb-0.5 rotate-180">
                    <ArrowLeftIcon />
                  </span>
                </span>
              }
              previousLabel={
                <span className="flex items-center select-none font-semibold text-xs md:text-sm text-gray-700 gap-1">
                  <span className="mb-0.5">
                    <ArrowLeftIcon />
                  </span>{" "}
                  Previous
                </span>
              }
              onPageChange={handlePageChange}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              pageCount={pageCount}
              forcePage={currentPage}
              pageLinkClassName="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer block"
              containerClassName="flex items-center relative w-full justify-center gap-2 px-4 py-3 rounded-2xl bg-white"
              pageClassName=" rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
              activeClassName="bg-gray-200 text-gray-900 font-medium"
              previousClassName="px-4 py-2 rounded-full  absolute left-4 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
              nextClassName="px-4 py-2 rounded-full bg-gray-50  absolute end-4 border text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
              breakClassName="px-3 py-1 font-semibold text-gray-400"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReminderContent />
    </Suspense>
  );
}
