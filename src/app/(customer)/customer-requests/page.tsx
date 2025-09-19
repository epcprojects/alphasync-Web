"use client";
import { PrescriptionRequestCard } from "@/app/components";
import AddNoteModal from "@/app/components/ui/modals/AddNoteModal";
import { SearchIcon, UserAddFilledIcon } from "@/icons";
import { showSuccessToast } from "@/lib/toast";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import React, { useState } from "react";
import { PrecriptionDATA } from "../../../../public/data/PrescriptionRequest";

const Page = () => {
  const [search, setSearch] = useState("");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const handleApprove = (title: string) => {
    showSuccessToast("Patient request approved successfully.");
    console.log(title);
  };

  const handleReject = (title: string) => {
    console.log(title);
  };

  const handleAddNote = (title: string) => {
    setIsNoteModalOpen(true);
    console.log(title);
  };

  const filterData = (status?: string) => {
    return PrecriptionDATA.filter((item) => {
      const matchesStatus = status ? item.status === status : true;
      const matchesSearch = item.title
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };
  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-8 pt-2 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <UserAddFilledIcon />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Requests
          </h2>
          <div className="px-3 py-1 rounded-full  bg-blue-50 text-blue-700 border border-blue-200 text-sm ">
            4 Requests
          </div>
        </div>

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
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 md:p-8">
        <TabGroup>
          <TabList className="flex items-center border-b border-b-gray-200  px-4 md:px-6">
            {["All", "Pending", "Approved", "Denied"].map((tab) => (
              <Tab
                key={tab}
                as="button"
                className="flex items-center justify-center w-full gap-1 md:gap-2 text-xs md:text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer text-gray-500 md:py-4 md:px-6"
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              {filterData().map((item) => (
                <PrescriptionRequestCard
                  key={item.id}
                  cardVarient="Customer"
                  onApprove={() => handleApprove(item.title)}
                  onReject={() => handleReject(item.title)}
                  onAddNote={() => handleAddNote(item.title)}
                  onViewDetails={() => {}}
                  onChat={() => {}}
                  {...item}
                />
              ))}
            </TabPanel>

            <TabPanel>
              {filterData("Pending Review").map((item) => (
                <PrescriptionRequestCard
                  key={item.id}
                  cardVarient="Customer"
                  onApprove={() => handleApprove(item.title)}
                  onReject={() => handleReject(item.title)}
                  onAddNote={() => handleAddNote(item.title)}
                  {...item}
                />
              ))}
            </TabPanel>

            <TabPanel>
              {filterData("Approved").map((item) => (
                <PrescriptionRequestCard
                  key={item.id}
                  cardVarient="Customer"
                  onApprove={() => handleApprove(item.title)}
                  onReject={() => handleReject(item.title)}
                  onAddNote={() => handleAddNote(item.title)}
                  {...item}
                />
              ))}
            </TabPanel>

            <TabPanel>
              {filterData("Denied").map((item) => (
                <PrescriptionRequestCard
                  key={item.id}
                  cardVarient="Customer"
                  onApprove={() => handleApprove(item.title)}
                  onReject={() => handleReject(item.title)}
                  onAddNote={() => handleAddNote(item.title)}
                  {...item}
                />
              ))}
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onConfirm={(note) => {
          showSuccessToast("Note added Successfully.");
          console.log(note);
        }}
        itemTitle="ORD-004"
      />
    </div>
  );
};

export default Page;
