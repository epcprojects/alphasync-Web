"use client";
import {
  PrescriptionRequestCard,
  Loader,
  EmptyState,
  RequestListSkeleton,
} from "@/app/components";
import AddNoteModal from "@/app/components/ui/modals/AddNoteModal";
import { RequestFilledIcon, SearchIcon } from "@/icons";
import Pagination from "@/app/components/ui/Pagination";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import RequestDetails, {
  requestDetails,
} from "@/app/components/ui/modals/RequestDetails";
import CustomerOrderPayment from "@/app/components/ui/modals/CustomerOrderPayment";
import PaymentSuccess from "@/app/components/ui/modals/PaymentSuccess";
import CustomerOrderSummary from "@/app/components/ui/modals/CustomerOrderSummary";
import { useIsMobile } from "@/hooks/useIsMobile";
import ChatWithPhysician from "@/app/components/ui/modals/CharWithPyhsicianModel";
import { useMutation, useQuery } from "@apollo/client";
import { ALL_ORDER_REQUESTS, FETCH_NOTES } from "@/lib/graphql/queries";
import { OrderRequestAttributes } from "@/lib/graphql/attributes";
import { CREATE_NOTE } from "@/lib/graphql/mutations";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface OrderRequestsResponse {
  allOrderRequests: {
    allData: OrderRequestAttributes[];
    dataCount: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

function CustomerRequestContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTargetRequest, setNoteTargetRequest] = useState<{
    originalId: string | number | null | undefined;
    displayId?: string | null;
    title?: string;
  } | null>(null);
  const [isDetailModelOpen, setIsDetailModelOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<requestDetails | null>(
    null
  );
  const [isSucess, setIsSuccess] = useState(false);
  const [isPaymentModel, setisPaymentModel] = useState(false);
  const [isSummaryModel, setIsSummaryModel] = useState(false);
  const [isChatModel, setIsChatModel] = useState(false);

  // Initialize tab index from query parameter
  const getInitialTabIndex = () => {
    const tab = searchParams.get("tab");
    if (tab === "pending") return 1;
    if (tab === "approved") return 2;
    if (tab === "denied") return 3;
    return 0; // Default to "All"
  };
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    getInitialTabIndex()
  );
  const [selectedPaymentRequest, setSelectedPaymentRequest] =
    useState<requestDetails | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [selectedChatInfo, setSelectedChatInfo] = useState<{
    doctorId: string;
    doctorName: string;
    requestDisplayId: string;
  } | null>(null);

  // Helper function to convert tab selection to API status value
  const getStatusFromTab = (tabIndex: number): string | undefined => {
    switch (tabIndex) {
      case 0: // All
        return undefined;
      case 1: // Pending
        return "pending";
      case 2: // Approved
        return "approved";
      case 3: // Denied
        return "denied";
      default:
        return undefined;
    }
  };

  // GraphQL query to fetch order requests
  const {
    data: orderRequestsData,
    loading: orderRequestsLoading,
    error: orderRequestsError,
    refetch: refetchOrderRequests,
  } = useQuery<OrderRequestsResponse>(ALL_ORDER_REQUESTS, {
    variables: {
      search: search || undefined,
      status: getStatusFromTab(selectedTabIndex),
      page: currentPage + 1, // GraphQL uses 1-based pagination
      perPage: itemsPerPage,
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const [createNote, { loading: isCreatingNote }] = useMutation(CREATE_NOTE);

  // Transform GraphQL data to match the card format
  const transformedRequests =
    orderRequestsData?.allOrderRequests.allData?.map((request, index) => {
      // Normalize status to match component expectations
      const normalizeStatus = (status: string | undefined) => {
        if (!status) return "Pending Review";
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === "approved") return "Approved";
        if (lowerStatus === "denied" || lowerStatus === "rejected")
          return "Denied";
        return "Pending Review";
      };

      // Get the first requested item for display
      const firstItem = request.requestedItems?.[0];
      const productInfo = firstItem?.product;

      // Generate a unique ID - use original ID if valid, otherwise use displayId or index
      const getUniqueId = () => {
        if (request.id !== null && request.id !== undefined) {
          const parsed =
            typeof request.id === "number"
              ? request.id
              : parseInt(String(request.id), 10);
          if (!isNaN(parsed)) return parsed;
        }
        if (request.displayId) {
          return `display-${request.displayId}-${index}`;
        }
        return `request-${index}`;
      };

      return {
        id: getUniqueId(),
        title: productInfo?.title || firstItem?.title || "Requested Item",
        subtitle: "",
        description: productInfo?.description || firstItem?.title || "",
        status: normalizeStatus(request.status),
        requestedDate: request.patient?.createdAt
          ? new Date(request.patient.createdAt).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })
          : "",
        doctorName:
          "Dr. " +
          (request.doctor?.fullName || request.patient?.fullName || "Unknown"),
        price: `$${firstItem?.price || 0}`,
        userNotes: request.notes || [],
        physicianNotes: request.doctorMessage || "",
        customerReason: request.reason || "",
        category: productInfo?.productType || "",
        imageSrc: "/images/fallbackImages/medicine-syrup.svg",
        originalId: request.id,
        displayId: request.displayId,
        doctorId: request.doctor?.id ? String(request.doctor.id) : "",
      };
    }) || [];

  const showEmptyState =
    !orderRequestsLoading && transformedRequests.length < 1;

  const handleApprove = (title: string) => {
    showSuccessToast("Patient request approved successfully.");
    console.log(title);
  };

  const handleReject = (title: string) => {
    console.log(title);
  };

  const handleAddNote = (request: {
    originalId: string | number | null | undefined;
    displayId?: string | null;
    title?: string;
  }) => {
    setNoteTargetRequest(request);
    setIsNoteModalOpen(true);
  };

  const handleRequests = (request: requestDetails) => {
    setSelectedRequest(request);
    setIsDetailModelOpen(true);
  };

  const handlePayment = (request: requestDetails) => {
    setSelectedPaymentRequest(request);
    setisPaymentModel(true);
  };

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  const pageCount = orderRequestsData?.allOrderRequests.totalPages || 1;

  // Update tab when query parameter changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "pending") {
      setSelectedTabIndex(1);
    } else if (tab === "approved") {
      setSelectedTabIndex(2);
    } else if (tab === "denied") {
      setSelectedTabIndex(3);
    } else {
      setSelectedTabIndex(0);
    }
  }, [searchParams]);

  // Reset to page 1 when tab changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedTabIndex]);

  const isMobile = useIsMobile();

  // Show error message if query fails
  if (orderRequestsError) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="text-red-600 text-center">
          Due to some technical issues, we are unable to fetch the requests.
          Please try again later.
        </div>
      </div>
    );
  }

  const requestCount = orderRequestsData?.allOrderRequests.dataCount || 0;
  const showSkeleton = orderRequestsLoading;

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex md:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <RequestFilledIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Requests
          </h2>
          <div className="md:px-3 py-0.5 px-2 md:py-1 rounded-full  bg-white whitespace-nowrap text-blue-700 border border-blue-200 text-sm ">
            {requestCount} Request{requestCount !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="bg-white rounded-full flex items-center gap-1 md:gap-2  md:px-2 md:py-2 p-1.5  shadow-table w-full md:w-fit">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-base md:py-2 bg-gray-100 w-full focus:bg-white md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white sm:p-4 lg:p-8 pt-0 sm:pt-0 lg:pt-0">
        <TabGroup
          selectedIndex={selectedTabIndex}
          onChange={setSelectedTabIndex}
        >
          <TabList
            className={
              "flex items-center border-b border-b-gray-200 gap-2 md:gap-3  md:justify-start  justify-between md:px-6"
            }
          >
            {["All", "Pending", "Approved", "Denied"].map((tab) => (
              <Tab
                key={tab}
                as="button"
                className={
                  "flex items-center gap-1 md:gap-2 w-full justify-center text-[11px] hover:bg-gray-50 whitespace-nowrap md:text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer  text-gray-500 px-2 py-3 md:py-4 md:px-6"
                }
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              {showSkeleton ? (
                <RequestListSkeleton />
              ) : showEmptyState ? (
                <EmptyState />
              ) : (
                transformedRequests.map((item) => (
                  <PrescriptionRequestCard
                    key={item.id}
                    cardVarient="Customer"
                    onApprove={() => handleApprove(item.title)}
                    onReject={() => handleReject(item.title)}
                    onAddNote={() => handleAddNote(item)}
                    onViewDetails={() => handleRequests(item)}
                    onChat={() => {
                      setSelectedChatInfo({
                        doctorId: item.doctorId || "",
                        doctorName: item.doctorName || "Physician",
                        requestDisplayId: item.displayId || "",
                      });
                      setIsChatModel(true);
                    }}
                    onPayment={() => {
                      handlePayment(item);
                    }}
                    {...item}
                  />
                ))
              )}
            </TabPanel>

            <TabPanel>
              {showSkeleton ? (
                <RequestListSkeleton />
              ) : showEmptyState ? (
                <EmptyState />
              ) : (
                transformedRequests.map((item) => (
                  <PrescriptionRequestCard
                    key={item.id}
                    cardVarient="Customer"
                    onApprove={() => handleApprove(item.title)}
                    onReject={() => handleReject(item.title)}
                    onAddNote={() => handleAddNote(item)}
                    onViewDetails={() => handleRequests(item)}
                    onChat={() => {
                      setSelectedChatInfo({
                        doctorId: item.doctorId || "",
                        doctorName: item.doctorName || "Physician",
                        requestDisplayId: item.displayId || "",
                      });
                      setIsChatModel(true);
                    }}
                    onPayment={() => {
                      handlePayment(item);
                    }}
                    {...item}
                  />
                ))
              )}
            </TabPanel>

            <TabPanel>
              {showSkeleton ? (
                <RequestListSkeleton />
              ) : showEmptyState ? (
                <EmptyState />
              ) : (
                transformedRequests.map((item) => (
                  <PrescriptionRequestCard
                    key={item.id}
                    cardVarient="Customer"
                    onApprove={() => handleApprove(item.title)}
                    onReject={() => handleReject(item.title)}
                    onAddNote={() => handleAddNote(item)}
                    onViewDetails={() => handleRequests(item)}
                    onPayment={() => {
                      handlePayment(item);
                    }}
                    {...item}
                  />
                ))
              )}
            </TabPanel>

            <TabPanel>
              {showSkeleton ? (
                <RequestListSkeleton />
              ) : showEmptyState ? (
                <EmptyState />
              ) : (
                transformedRequests.map((item) => (
                  <PrescriptionRequestCard
                    key={item.id}
                    cardVarient="Customer"
                    onApprove={() => handleApprove(item.title)}
                    onReject={() => handleReject(item.title)}
                    onAddNote={() => handleAddNote(item)}
                    onViewDetails={() => handleRequests(item)}
                    {...item}
                    onPayment={() => {
                      handlePayment(item);
                    }}
                  />
                ))
              )}
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>

      {/* Pagination */}
      {!showSkeleton && transformedRequests.length > 0 && pageCount > 1 && (
        <div className="flex justify-center flex-col gap-2 md:gap-6">
          <Pagination
            currentPage={currentPage}
            totalPages={pageCount}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {isDetailModelOpen && (
        <RequestDetails
          isOpen={isDetailModelOpen}
          onClose={() => setIsDetailModelOpen(false)}
          request={selectedRequest}
          onClick={() => {
            setIsDetailModelOpen(false);
            if (selectedRequest) {
              setSelectedPaymentRequest(selectedRequest);
              setisPaymentModel(true);
            }
          }}
          oncancel={() => {
            setIsDetailModelOpen(false);
            setIsChatModel(true);
          }}
        />
      )}
      {isPaymentModel && selectedPaymentRequest && (
        <CustomerOrderPayment
          isOpen={isPaymentModel}
          onClose={() => {
            setisPaymentModel(false);
            setSelectedPaymentRequest(null);
          }}
          request={{
            id: selectedPaymentRequest.id,
            medicineName: selectedPaymentRequest.title,
            doctorName: selectedPaymentRequest.doctorName || "Unknown Doctor",
            strength: selectedPaymentRequest.subtitle || "",
            requestedOn: selectedPaymentRequest.requestedDate || "",
            price: parseFloat(
              selectedPaymentRequest.price?.replace(/[^0-9.-]+/g, "") || "0"
            ),
            status: selectedPaymentRequest.status,
            category: selectedPaymentRequest.category || "",
          }}
          onClick={() => {
            setisPaymentModel(false);
            setSelectedPaymentRequest(null);
            setIsSuccess(true);
          }}
        />
      )}
      {selectedChatInfo && (
        <ChatWithPhysician
          isOpen={isChatModel}
          onClose={() => {
            setIsChatModel(false);
            setSelectedChatInfo(null);
          }}
          participantId={selectedChatInfo.doctorId}
          participantName={selectedChatInfo.doctorName}
          itemTitle={selectedChatInfo.requestDisplayId}
        />
      )}
      <PaymentSuccess
        isOpen={isSucess}
        onClose={() => setIsSuccess(false)}
        viewOrder={() => {
          setIsSuccess(false);
          setIsSummaryModel(true);
        }}
        btnTitle={"View Requests"}
      />
      <CustomerOrderSummary
        isOpen={isSummaryModel}
        onClose={() => setIsSummaryModel(false)}
        order={{
          displayId: "123456",
          orderedOn: "8/8/2025",
          doctorName: "Dr. Arina Baker",
          totalPrice: 120,
          orderItems: [
            {
              id: 123456,
              medicineName: "Semaglutide",
              quantity: 1,
              amount: "120",
              price: 89.99,
            },
          ],
        }}
      />
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setNoteTargetRequest(null);
        }}
        onConfirm={async ({ note }) => {
          if (!noteTargetRequest?.originalId) {
            showErrorToast("Unable to determine the selected request.");
            throw new Error("Missing notable ID");
          }

          try {
            await createNote({
              variables: {
                notableId: String(noteTargetRequest.originalId),
                notableType: "ORDER_REQUEST",
                content: note,
              },
            });
            showSuccessToast("Note added successfully.");
            setIsNoteModalOpen(false);
            setNoteTargetRequest(null);
            refetchOrderRequests();
          } catch (error) {
            console.error("Error creating note:", error);
            showErrorToast("Failed to add note. Please try again.");
            throw error;
          }
        }}
        itemTitle={
          noteTargetRequest?.displayId || noteTargetRequest?.title || ""
        }
        isSubmitting={isCreatingNote}
        disableAutoClose
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <CustomerRequestContent />
    </Suspense>
  );
}
