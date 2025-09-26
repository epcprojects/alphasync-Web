"use client";
import { PrescriptionRequestCard } from "@/app/components";
import AddNoteModal from "@/app/components/ui/modals/AddNoteModal";
import { RequestFilledIcon, SearchIcon } from "@/icons";
import { showSuccessToast } from "@/lib/toast";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import React, { useState } from "react";
import { PrecriptionDATA } from "../../../../public/data/PrescriptionRequest";
import RequestDetails, {
  requestDetails,
} from "@/app/components/ui/modals/RequestDetails";
import CustomerOrderPayment from "@/app/components/ui/modals/CustomerOrderPayment";
import PaymentSuccess from "@/app/components/ui/modals/PaymentSuccess";
import { useIsMobile } from "@/hooks/useIsMobile";

const Page = () => {
  const [search, setSearch] = useState("");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDetailModelOpen, setIsDetailModelOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<requestDetails | null>(
    null
  );
  const [isSucess, setIsSuccess] = useState(false);
  const [isPaymentModel, setisPaymentModel] = useState(false);
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

  const handleRequests = (request: requestDetails) => {
    setSelectedRequest(request);
    setIsDetailModelOpen(true);
  };

  const isMobile = useIsMobile();

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex md:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <RequestFilledIcon />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Requests
          </h2>
          <div className="md:px-3 text-xs py-0.5 px-2 md:py-1 rounded-full  bg-white whitespace-nowrap text-blue-700 border border-blue-200 md:text-sm ">
            4 Requests
          </div>
        </div>

        <div className="bg-white rounded-full flex items-center gap-1 md:gap-2 p-2 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_rgba(0,0,0,0.06)] w-full md:w-fit">
          <div className="flex items-center relative w-full">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-sm md:text-base md:py-2 bg-gray-100 w-full  md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white sm:p-4 lg:p-8 pt-0 sm:pt-0 lg:pt-0">
        <TabGroup>
          <TabList className="flex items-center border-b border-b-gray-200 md:justify-start  justify-between sm:px-4 lg:px-6">
            {["All", "Pending", "Approved", "Denied"].map((tab) => (
              <Tab
                key={tab}
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 w-full justify-center text-[11px] whitespace-nowrap md:text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-2 py-3 md:py-4 md:px-6"
                }
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
                  onViewDetails={() => handleRequests(item)}
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
      <RequestDetails
        isOpen={isDetailModelOpen}
        onClose={() => setIsDetailModelOpen(false)}
        request={selectedRequest}
        onClick={() => {
          setIsDetailModelOpen(false);
          setisPaymentModel(true);
        }}
      />
      {isPaymentModel && (
        <CustomerOrderPayment
          isOpen={isPaymentModel}
          onClose={() => {
            setisPaymentModel(false);
          }}
          request={{
            id: "123456",
            medicineName: "Semaglutide",
            doctorName: "Dr. Arina Baker",
            strength: "5 mg vial",
            price: "120",
          }}
          onClick={() => {
            setisPaymentModel(false);
            setIsSuccess(true);
          }}
        />
      )}
      <PaymentSuccess
        isOpen={isSucess}
        onClose={() => setIsSuccess(false)}
        viewOrder={() => {
          setIsSuccess(false);
        }}
        btnTitle={"View Requests"}
      />
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
