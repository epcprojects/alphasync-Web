"use client";

import { ArrowLeftIcon, ReminderFilledIcon, SearchIcon } from "@/icons";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { reminders } from "../../../../public/data/reminders";
import ReactPaginate from "react-paginate";
import RefillView from "@/app/components/ui/cards/RefillView";
import { useIsMobile } from "@/hooks/useIsMobile";
import ChatModal from "@/app/components/ui/modals/ChatModal";

function ReminderContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
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

  const [messages, setMessages] = useState<
    { sender: string; time: string; text: string; isUser: boolean }[]
  >([]);
  const [toggle, setToggle] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (msg: string) => {
    if (!msg.trim()) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        sender: toggle ? "You" : "John Smith",
        time,
        text: msg,
        isUser: toggle,
      },
    ]);

    setToggle(!toggle);
  };

  const isMobile = useIsMobile();

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <ReminderFilledIcon
              height={isMobile ? 16 : 20}
              width={isMobile ? 16 : 20}
            />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Customers Due for Refills
          </h2>
          <div className="px-3 py-1 rounded-full bg-white border border-indigo-200">
            <p className="text-sm font-medium text-primary whitespace-nowrap">
              {reminders.length}
            </p>
          </div>
        </div>

        <div className="flex items-center relative w-full lg:w-fit  bg-white  p-2 rounded-full shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]">
          <span className="absolute left-4">
            <SearchIcon
              height={isMobile ? "16" : "20"}
              width={isMobile ? "16" : "20"}
            />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-sm md:text-base md:py-2 bg-gray-100 w-full  md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
          />
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-1">
          <div className="hidden sm:grid sm:grid-cols-[4fr_2fr_1fr_1fr_3fr] lg:grid-cols-[1fr_1fr_1fr_1fr_400px] text-black font-medium text-xs gap-4 px-2 py-2.5 bg-white rounded-xl shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)]">
            <div>
              <h2>Customer</h2>
            </div>
            <div>
              <h2>Product</h2>
            </div>
            <div>
              <h2 className="whitespace-nowrap">Last Order</h2>
            </div>
            <div>
              <h2 className="whitespace-nowrap">Days Since</h2>
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
              onContactClick={() => setIsChatModalOpen(true)}
              onReOrderClick={() => {}}
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
                containerClassName="flex items-center relative w-full justify-center gap-2 px-3 md:px-4 py-2 md:py-3  h-12 md:h-full rounded-2xl bg-white"
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
      </div>
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        // itemTitle="REQ-001"
        messages={messages}
        onSend={(msg) => {
          handleSend(msg);
        }}
      />
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
