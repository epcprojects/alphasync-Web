"use client";

import { ArrowDownIcon, RequestFilledIcon, SearchIcon } from "@/icons";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";

import RequestListView from "@/app/components/ui/cards/RequestListView";
import Pagination from "@/app/components/ui/Pagination";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import {
  EmptyState,
  Loader,
  RequestRejectModal,
  RequestApproveModal,
  RequestListSkeleton,
} from "@/app/components";
import ChatModal from "@/app/components/ui/modals/ChatModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_ORDER_REQUESTS } from "@/lib/graphql/queries";
import {
  APPROVE_ORDER_REQUEST,
  DENY_ORDER_REQUEST,
} from "@/lib/graphql/mutations";
import { OrderRequestAttributes } from "@/lib/graphql/attributes";

interface OrderRequestsResponse {
  allOrderRequests: {
    allData: OrderRequestAttributes[];
    dataCount: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

function RequestContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [selectedChatPatient, setSelectedChatPatient] = useState<{
    id: string;
    name: string;
    requestId: string;
  } | null>(null);
  const orderStatuses = [
    { label: "Pending", value: "pending", color: "before:bg-amber-500" },
    { label: "Approved", value: "approved", color: "before:bg-green-500" },
    { label: "Denied", value: "denied", color: "before:bg-red-500" },
  ];

  const itemsPerPage = 10;
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  // Helper function to convert display label to API value
  const getStatusValue = (statusLabel: string): string | undefined => {
    if (statusLabel === "All Status") return undefined;
    const statusObj = orderStatuses.find((s) => s.label === statusLabel);
    return statusObj?.value;
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
      status: getStatusValue(selectedStatus),
      page: currentPage + 1, // GraphQL uses 1-based pagination
      perPage: itemsPerPage,
      reorder: selectedTabIndex === 1 ? true : false,
    },
    fetchPolicy: "network-only",
  });

  // GraphQL mutation to approve order request
  const [approveOrderRequest, { loading: isApproving }] = useMutation(
    APPROVE_ORDER_REQUEST
  );

  // GraphQL mutation to deny order request
  const [denyOrderRequest, { loading: isDenying }] =
    useMutation(DENY_ORDER_REQUEST);

  const transformedRequests =
    orderRequestsData?.allOrderRequests.allData?.map((request, index) => {
      // Normalize status to match class names
      const normalizeStatus = (status: string | undefined) => {
        if (!status) return "Pending";
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === "approved") return "Approved";
        if (lowerStatus === "denied" || lowerStatus === "rejected")
          return "Denied";
        if (lowerStatus === "pending" || lowerStatus === "requested")
          return "Pending";
        return "Pending";
      };

      return {
        id: typeof request.id === "number" ? request.id : index + 1,
        requestID: request.displayId || `REQ-${request.id || index}`,
        customer: request.patient?.fullName || "Patient",
        email: request.patient?.email || "N/A",
        date: request.patient?.createdAt
          ? new Date(request.patient.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
        items:
          request.requestedItems?.map((item) => item.title || "Unknown item") ||
          [],
        amount: (() => {
          // Priority: requestCustomPrice -> customPrice -> price
          if (
            request.requestCustomPrice !== undefined &&
            request.requestCustomPrice !== null
          ) {
            return typeof request.requestCustomPrice === "string"
              ? parseFloat(request.requestCustomPrice)
              : (request.requestCustomPrice as number) || 0;
          }
          // Fallback to calculating from items
          return (
            request.requestedItems?.reduce((sum, item) => {
              const priceToUse = item.product?.customPrice || item.price;
              const price =
                typeof priceToUse === "string"
                  ? parseFloat(priceToUse)
                  : (priceToUse as number) || 0;
              return sum + price;
            }, 0) || 0
          );
        })(),
        status: normalizeStatus(request.status),
        orderPaid: request.orderPaid || false,
        originalId: request.id,
        patientId: request.patient?.id,
      };
    }) || [];

  const pageCount = orderRequestsData?.allOrderRequests.totalPages || 1;
  const currentItems = transformedRequests;

  useEffect(() => {
    setCurrentPage(0);
    // Refetch data when search changes
    refetchOrderRequests({
      search: search || undefined,
      status: getStatusValue(selectedStatus),
      page: 1,
      perPage: itemsPerPage,
      reorder: selectedTabIndex === 1 ? true : false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Refetch data when status changes
  useEffect(() => {
    refetchOrderRequests({
      search: search || undefined,
      status: getStatusValue(selectedStatus),
      page: currentPage + 1,
      perPage: itemsPerPage,
      reorder: selectedTabIndex === 1 ? true : false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  // Refetch data when tab changes
  useEffect(() => {
    setCurrentPage(0);
    refetchOrderRequests({
      search: search || undefined,
      status: getStatusValue(selectedStatus),
      page: 1,
      perPage: itemsPerPage,
      reorder: selectedTabIndex === 1 ? true : false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTabIndex]);

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
    // Refetch data with new page number
    refetchOrderRequests({
      search: search || undefined,
      status: getStatusValue(selectedStatus),
      page: selectedPage + 1,
      perPage: itemsPerPage,
      reorder: selectedTabIndex === 1 ? true : false,
    });
  };

  const isMobile = useIsMobile();

  // Show error message if query fails
  if (orderRequestsError) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="text-red-600 text-center">
          {orderRequestsError.message}
        </div>
      </div>
    );
  }

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
        </div>

        <div className="bg-white rounded-full w-full flex items-center gap-1 md:gap-2  md:px-2.5 md:py-2 p-1.5 shadow-table sm:w-fit">
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
              className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-base md:py-2 focus:bg-white bg-gray-100 w-full  md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
            />
          </div>

          <Menu>
            <MenuButton className="inline-flex py-1.5 md:py-2 px-2 sm:px-3 cursor-pointer whitespace-nowrap bg-gray-100 text-gray-700 items-center gap-2 rounded-full text-xs md:text-sm font-medium  shadow-inner  focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-300 data-open:bg-gray-100">
              {selectedStatus} <ArrowDownIcon fill="#717680" />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className={`min-w-32 md:min-w-44  z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
            >
              <MenuItem>
                <button
                  onClick={() => {
                    setSelectedStatus("All Status");
                    setCurrentPage(0);
                    refetchOrderRequests({
                      search: search || undefined,
                      status: undefined,
                      page: 1,
                      perPage: itemsPerPage,
                      reorder: selectedTabIndex === 1 ? true : false,
                    });
                  }}
                  className="text-gray-500 hover:bg-gray-100 w-full py-2 px-2.5 rounded-md text-xs md:text-sm text-start"
                >
                  All Status
                </button>
              </MenuItem>
              {orderStatuses.map((status) => (
                <MenuItem key={status.label}>
                  <button
                    onClick={() => {
                      setSelectedStatus(status.label);
                      setCurrentPage(0);
                      refetchOrderRequests({
                        search: search || undefined,
                        status: status.value,
                        page: 1,
                        perPage: itemsPerPage,
                        reorder: selectedTabIndex === 1 ? true : false,
                      });
                    }}
                    className={`flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full before:w-1.5 before:h-1.5 before:flex-shrink-0 before:content-[''] before:rounded-full before:relative before:block ${status.color}`}
                  >
                    {status.label}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </div>

      {/* Tabs for Requests/Reorder Requests */}
      <div className="sm:bg-white rounded-xl sm:shadow-table">
        <TabGroup
          selectedIndex={selectedTabIndex}
          onChange={setSelectedTabIndex}
        >
          <TabList className="flex items-center border-b bg-white rounded-t-xl mb-2 sm:mb-0 border-b-gray-200 gap-2 md:gap-3 md:justify-start justify-between md:px-4">
            {["Requests", "Reorder Requests"].map((tab, index) => (
              <Tab
                key={index}
                as="button"
                className="flex items-center gap-1 md:gap-2 w-full justify-center hover:bg-gray-50 whitespace-nowrap text-sm sm:text-base outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer text-gray-500 px-1.5 py-2.5 md:py-4 md:px-6"
              >
                {tab}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className=" flex flex-col md:gap-6 p-0 md:p-4 pt-0">
                <div className="flex flex-col gap-1">
                  {!orderRequestsLoading && (
                    <div className="hidden sm:grid grid-cols-[1fr_14rem_1fr_1fr_160px_120px] lg:grid-cols-[1fr_16rem_1fr_1fr_1fr_1fr_1fr_160px] text-black font-medium text-sm gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
                      <div>
                        <h2 className="whitespace-nowrap">Request ID</h2>
                      </div>
                      <div>
                        <h2>Patient</h2>
                      </div>
                      <div className="lg:block hidden">
                        <h2>Date</h2>
                      </div>
                      <div className="lg:block hidden">
                        <h2>Items</h2>
                      </div>
                      <div>
                        <h2>Total</h2>
                      </div>
                      <div>
                        <h2>Status</h2>
                      </div>
                      <div>
                        <h2>Payment Status</h2>
                      </div>
                      <div>
                        <h2>Actions</h2>
                      </div>
                    </div>
                  )}

                  {orderRequestsLoading ? (
                    <RequestListSkeleton />
                  ) : (
                    currentItems.map((order) => (
                      <RequestListView
                        key={order.requestID}
                        request={order}
                        onProfileBtn={() =>
                          router.push(`/customers/${order.patientId}`)
                        }
                        onAcceptBtn={() => {
                          setSelectedRequestId(String(order.originalId));
                          setIsApproveModalOpen(true);
                        }}
                        onRejectBtn={() => {
                          setSelectedRequestId(String(order.originalId));
                          setIsRejectModalOpen(true);
                        }}
                        onChatBtn={() => {
                          setSelectedChatPatient({
                            id: String(order.patientId || ""),
                            name: order.customer,
                            requestId: order.requestID,
                          });
                          setIsChatModalOpen(true);
                        }}
                      />
                    ))
                  )}
                </div>
                <div className="flex justify-center flex-col gap-2 mt-2 md:gap-6 ">
                  {!orderRequestsLoading && currentItems.length < 1 && (
                    <EmptyState mtClasses="-mt-0 md:-mt-4 " />
                  )}

                  {!orderRequestsLoading && currentItems.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pageCount}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div className=" flex flex-col md:gap-6 p-0 md:p-4 pt-0">
                <div className="flex flex-col gap-1">
                  {!orderRequestsLoading && (
                    <div className="hidden sm:grid grid-cols-[1fr_14rem_1fr_1fr_160px_120px] lg:grid-cols-[1fr_16rem_1fr_1fr_1fr_1fr_1fr_160px] text-black font-medium text-sm gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
                      <div>
                        <h2 className="whitespace-nowrap">Request ID</h2>
                      </div>
                      <div>
                        <h2>Patient</h2>
                      </div>
                      <div className="lg:block hidden">
                        <h2>Date</h2>
                      </div>
                      <div className="lg:block hidden">
                        <h2>Items</h2>
                      </div>
                      <div>
                        <h2>Total</h2>
                      </div>
                      <div>
                        <h2>Status</h2>
                      </div>
                      <div>
                        <h2>Payment Status</h2>
                      </div>
                      <div>
                        <h2>Actions</h2>
                      </div>
                    </div>
                  )}

                  {orderRequestsLoading ? (
                    <RequestListSkeleton />
                  ) : (
                    currentItems.map((order) => (
                      <RequestListView
                        key={order.requestID}
                        request={order}
                        onProfileBtn={() =>
                          router.push(`/customers/${order.patientId}`)
                        }
                        onAcceptBtn={() => {
                          setSelectedRequestId(String(order.originalId));
                          setIsApproveModalOpen(true);
                        }}
                        onRejectBtn={() => {
                          setSelectedRequestId(String(order.originalId));
                          setIsRejectModalOpen(true);
                        }}
                        onChatBtn={() => {
                          setSelectedChatPatient({
                            id: String(order.patientId || ""),
                            name: order.customer,
                            requestId: order.requestID,
                          });
                          setIsChatModalOpen(true);
                        }}
                      />
                    ))
                  )}
                </div>
                <div className="flex justify-center flex-col gap-2 mt-2 md:gap-6 ">
                  {!orderRequestsLoading && currentItems.length < 1 && (
                    <EmptyState mtClasses="-mt-0 md:-mt-4 " />
                  )}

                  {!orderRequestsLoading && currentItems.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pageCount}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
      <RequestRejectModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          if (!isDenying) {
            setIsRejectModalOpen(false);
            setSelectedRequestId(null);
          }
        }}
        onConfirm={async (data) => {
          try {
            await denyOrderRequest({
              variables: {
                requestId: selectedRequestId,
                doctorMessage: data.reason,
              },
            });
            showErrorToast("Patient request denied.");
            // Refetch the data to update the UI
            refetchOrderRequests();
            // Close modal after successful mutation
            setIsRejectModalOpen(false);
            setSelectedRequestId(null);
          } catch (error) {
            showErrorToast("Failed to deny request. Please try again.");
            console.error("Error denying request:", error);
            // Keep modal open on error so user can try again
          }
        }}
        isSubmitting={isDenying}
        itemTitle={
          currentItems.find(
            (item) => String(item.originalId) === selectedRequestId
          )?.requestID || ""
        }
      />

      <RequestApproveModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          if (!isApproving) {
            setIsApproveModalOpen(false);
            setSelectedRequestId(null);
          }
        }}
        onConfirm={async (data) => {
          try {
            await approveOrderRequest({
              variables: {
                requestId: selectedRequestId,
                doctorMessage: data.doctorMessage || null,
              },
            });
            showSuccessToast("Patient request approved successfully.");
            // Refetch the data to update the UI
            refetchOrderRequests();
            // Close modal after successful mutation
            setIsApproveModalOpen(false);
            setSelectedRequestId(null);
          } catch (error) {
            showErrorToast("Failed to approve request. Please try again.");
            console.error("Error approving request:", error);
            // Keep modal open on error so user can try again
          }
        }}
        isSubmitting={isApproving}
        itemTitle={
          currentItems.find(
            (item) => String(item.originalId) === selectedRequestId
          )?.requestID || ""
        }
      />

      {selectedChatPatient && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedChatPatient(null);
          }}
          participantId={selectedChatPatient.id}
          participantName={selectedChatPatient.name}
          itemTitle={selectedChatPatient.requestId}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <RequestContent />
    </Suspense>
  );
}
