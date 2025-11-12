"use client";
import {
  Chat,
  NoteCard,
  ThemeButton,
  CustomerOrderHistroyView,
  PrescriptionRequestCard,
  RequestRejectModal,
  RequestApproveModal,
  Skeleton,
  Pagination,
  AppModal,
} from "@/app/components";
import {
  ArrowDownIcon,
  BubbleChatIcon,
  NoteIcon,
  PackageOutlineIcon,
  PlusIcon,
  RequestTabIcon,
} from "@/icons";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useState } from "react";
import AddNoteModal from "@/app/components/ui/modals/AddNoteModal";
import ProductRequestDetailModal from "@/app/components/ui/modals/ProductRequestDetailModal";
import ChatModal from "@/app/components/ui/modals/ChatModal";
import NewOrderModal from "@/app/components/ui/modals/NewOrderModal";
import CustomerProfileHeaderCard from "@/app/components/ui/cards/CustomerProfileHeaderCard";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  FETCH_CUSTOMER,
  PATIENT_ORDERS,
  ALL_ORDER_REQUESTS,
  FETCH_NOTES,
} from "@/lib/graphql/queries";
import {
  UserAttributes,
  OrderRequestAttributes,
} from "@/lib/graphql/attributes";
import {
  APPROVE_ORDER_REQUEST,
  CREATE_NOTE,
  DENY_ORDER_REQUEST,
  DELETE_NOTE,
} from "@/lib/graphql/mutations";

// Interface for GraphQL response
interface FetchUserResponse {
  fetchUser: {
    user: UserAttributes;
  };
}

// Interface for Patient Orders response
interface PatientOrdersResponse {
  patientOrders: {
    allData: {
      id: string;
      displayId: string;
      status: string;
      createdAt: string;
      totalPrice: number;
    }[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

// Interface for Order Requests response
interface OrderRequestsResponse {
  allOrderRequests: {
    allData: OrderRequestAttributes[];
    dataCount: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

interface NoteData {
  id: string;
  content: string;
  createdAt: string;
  notableId: string;
  notableType: string;
  author?: {
    id: string;
    fullName?: string;
    email?: string;
  } | null;
}

interface FetchNotesResponse {
  fetchNotes: NoteData[];
}

export default function CustomerDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isDeleteNoteModalOpen, setIsDeleteNoteModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // State declarations
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemsPerPage = 10;
  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [requestsCurrentPage, setRequestsCurrentPage] = useState(0);
  const requestsPerPage = 10;

  // GraphQL query to fetch customer data
  const { data, loading, error } = useQuery<FetchUserResponse>(FETCH_CUSTOMER, {
    variables: {
      id: params.id,
    },
    skip: !params.id,
    fetchPolicy: "network-only",
  });

  // GraphQL query to fetch patient orders
  const {
    data: ordersData,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery<PatientOrdersResponse>(PATIENT_ORDERS, {
    variables: {
      patientId: params.id,
      page: currentPage + 1, // GraphQL pagination is usually 1-based
      perPage: itemsPerPage,
    },
    skip: !params.id,
    fetchPolicy: "network-only",
  });

  // GraphQL query to fetch order requests for this patient
  const {
    data: requestsData,
    loading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useQuery<OrderRequestsResponse>(ALL_ORDER_REQUESTS, {
    variables: {
      patientId: params.id,
      page: requestsCurrentPage + 1,
      perPage: requestsPerPage,
    },
    skip: !params.id,
    fetchPolicy: "network-only",
  });

  const {
    data: notesData,
    loading: notesLoading,
    error: notesError,
    refetch: refetchNotes,
  } = useQuery<FetchNotesResponse>(FETCH_NOTES, {
    variables: {
      notableId: params.id,
    },
    skip: !params.id,
    fetchPolicy: "network-only",
  });

  // GraphQL mutation to approve order request
  const [approveOrderRequest, { loading: isApproving }] = useMutation(
    APPROVE_ORDER_REQUEST
  );

  // GraphQL mutation to deny order request
  const [denyOrderRequest, { loading: isDenying }] =
    useMutation(DENY_ORDER_REQUEST);
  const [createNote, { loading: isCreatingNote }] = useMutation(CREATE_NOTE);
  const [deleteNote, { loading: isDeletingNote }] = useMutation(DELETE_NOTE);

  const customer = data?.fetchUser?.user;
  const patientOrders = ordersData?.patientOrders;
  const orderRequests = requestsData?.allOrderRequests.allData || [];
  const requestsPageCount = requestsData?.allOrderRequests.totalPages || 1;

  console.log("Requests Data:", {
    totalPages: requestsData?.allOrderRequests.totalPages,
    dataCount: requestsData?.allOrderRequests.dataCount,
    requestsCurrentPage,
    requestsPerPage,
  });

  // Use GraphQL data for pagination
  const pageCount = patientOrders?.totalPages || 0;
  const currentItems = patientOrders?.allData || [];
  const notes = notesData?.fetchNotes || [];

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
    // Refetch orders with new page number
    refetchOrders({
      patientId: params.id,
      page: selectedPage + 1,
      perPage: itemsPerPage,
    });
  };

  // Transform order requests to PrescriptionRequestCard format
  const transformedRequests =
    orderRequests.map((request) => {
      // Normalize status
      const normalizeStatus = (status: string | undefined) => {
        if (!status) return "Pending Review";
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === "approved") return "Approved";
        if (lowerStatus === "denied" || lowerStatus === "rejected")
          return "Denied";
        return "Pending Review";
      };

      const firstItem = request.requestedItems?.[0];
      const totalAmount =
        request.requestedItems?.reduce((sum, item) => {
          const price =
            typeof item.price === "string"
              ? parseFloat(item.price)
              : (item.price as number) || 0;
          return sum + price;
        }, 0) || 0;

      return {
        id: String(request.id),
        displayId: request.displayId || `REQ-${request.id}`,
        title: firstItem?.title || "Multiple Products",
        subtitle:
          request.requestedItems && request.requestedItems.length > 1
            ? `(${request.requestedItems.length} items)`
            : "",
        description:
          firstItem?.product?.description || firstItem?.product?.title || "",
        status: normalizeStatus(request.status),
        requestedDate: request.patient?.createdAt
          ? new Date(request.patient.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
        reviewedDate:
          request.status === "approved" || request.status === "denied"
            ? new Date().toLocaleDateString()
            : undefined,
        doctorName: request.doctor?.fullName || "Dr. Unknown",
        price: `$${totalAmount.toFixed(2)}`,
        userNotes: undefined, // Hide patient notes for doctor view
        physicianNotes: request.doctorMessage,
        denialReason: request.reason, // Show reason for all statuses
        category: firstItem?.product?.productType || "General",
        imageSrc: "/images/fallbackImages/medicine-syrup.svg",
        requestedItems: request.requestedItems,
      };
    }) || [];

  const handleApprove = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsApproveModalOpen(true);
  };

  const handleReject = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsRejectModalOpen(true);
  };

  const handleAddNote = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsNoteModalOpen(true);
  };

  const handleViewDetails = (requestId: string) => {
    const request = transformedRequests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequestId(requestId);
      setIsDetailModalOpen(true);
    }
  };

  const handleChat = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsChatModalOpen(true);
  };

  const handleRequestsPageChange = (selectedPage: number) => {
    setRequestsCurrentPage(selectedPage);
    refetchRequests({
      patientId: params.id,
      page: selectedPage + 1,
      perPage: requestsPerPage,
    });
  };

  const handleCreateOrder = (data: {
    customer: string;
    items: { product: string; quantity: number; price: number }[];
    totalAmount: number;
  }) => {
    console.log("Final Order Data:", data);
  };

  const handleQuickChat = () => {
    setSelectedIndex(1); // Switch to chat tab
  };

  const handleChatCreated = () => {
    // Chat created successfully
  };

  // Show loading state
  if (loading) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={router.back}
            className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
          >
            <ArrowDownIcon />
          </button>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Customer Profile
          </h2>
        </div>
        <div className="w-full bg-white rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] p-6">
          <div className="space-y-4">
            <Skeleton className="w-full h-32 rounded-lg" />
            <Skeleton className="w-full h-20 rounded-lg" />
            <Skeleton className="w-full h-40 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={router.back}
            className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
          >
            <ArrowDownIcon />
          </button>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Customer Profile
          </h2>
        </div>
        <div className="w-full bg-white rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] p-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!customer) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={router.back}
            className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
          >
            <ArrowDownIcon />
          </button>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Customer Profile
          </h2>
        </div>
        <div className="w-full bg-white rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Customer not found</p>
            <ThemeButton label="Go Back" onClick={() => router.back()} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={router.back}
          className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
        >
          <ArrowDownIcon />
        </button>
        <h2 className="text-black font-semibold text-lg md:text-3xl">
          Customer Profile
        </h2>
      </div>

      <div className="w-full bg-white rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <CustomerProfileHeaderCard
          name={customer.fullName || "Unknown Customer"}
          email={customer.email || ""}
          phone={customer.phoneNo || ""}
          totalOrders={patientOrders?.count || 0}
          statusActive={customer.status === "active"}
          lastOrder={
            patientOrders?.allData?.[0]?.createdAt
              ? new Date(
                  patientOrders.allData[0].createdAt
                ).toLocaleDateString()
              : "No orders"
          }
          dob={customer.dateOfBirth || ""}
          onQuickChat={handleQuickChat}
          onCreateOrder={() => setIsOrderModalOpen(true)}
          getInitials={(name) =>
            name
              .split(" ")
              .map((n) => n[0])
              .join("")
          }
        />

        <div className=" ">
          <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <TabList
              className={
                "flex items-center border-b border-b-gray-200 gap-2 md:gap-3 md:justify-start  justify-between md:px-6"
              }
            >
              {[
                {
                  icon: <PackageOutlineIcon fill="currentColor" />,
                  label: "Order History",
                },
                {
                  icon: (
                    <BubbleChatIcon
                      fill="currentColor"
                      height="18"
                      width="18"
                    />
                  ),
                  label: "Chat Messages",
                },
                {
                  icon: <NoteIcon fill="currentColor" />,
                  label: "Patient Notes",
                },
                {
                  icon: <RequestTabIcon fill="currentColor" />,
                  label: "Requests",
                },
              ].map((tab, index) => (
                <Tab
                  key={index}
                  as="button"
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm outline-none hover:bg-gray-50 border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer text-gray-500 md:py-4 md:px-6"
                >
                  {tab.icon} {tab.label}
                </Tab>
              ))}
            </TabList>
            <TabPanels className={"p-4 md:p-6"}>
              <TabPanel className={""}>
                {ordersLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="w-full h-12 rounded-lg" />
                    <Skeleton className="w-full h-16 rounded-lg" />
                    <Skeleton className="w-full h-16 rounded-lg" />
                    <Skeleton className="w-full h-16 rounded-lg" />
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-4"> {ordersError.message}</p>
                  </div>
                ) : currentItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      No orders found for this customer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_5rem] gap-4 p-1.5 md:p-3 text-xs font-medium bg-gray-50 rounded-lg text-black">
                      <div className="">Order ID</div>
                      <div className="">Date</div>
                      <div className="">Status</div>
                      <div className="">Total</div>
                      <div className="text-center">Actions</div>
                    </div>
                    {currentItems.map((order) => (
                      <CustomerOrderHistroyView
                        onRowClick={() => router.push(`/orders/${order.id}`)}
                        key={order.id}
                        order={{
                          orderId: order.displayId,
                          date: new Date(order.createdAt).toLocaleDateString(),
                          status: order.status,
                          totalAmount: order.totalPrice,
                        }}
                        onViewOrderDetails={() =>
                          router.push(`/orders/${order.id}`)
                        }
                      />
                    ))}
                  </div>
                )}
                {!ordersLoading && !ordersError && currentItems.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pageCount}
                    onPageChange={handlePageChange}
                  />
                )}
              </TabPanel>
              <TabPanel>
                <Chat
                  participantId={params.id}
                  participantName={customer?.fullName}
                  onChatCreated={handleChatCreated}
                />
              </TabPanel>
              <TabPanel>
                <div className="flex justify-end">
                  <ThemeButton
                    variant="outline"
                    label="Add New"
                    icon={<PlusIcon />}
                    onClick={() => {
                      setIsNoteModalOpen(true);
                    }}
                  />
                </div>
                {notesLoading ? (
                  <div className="space-y-4 mt-4">
                    <Skeleton className="w-full h-16 rounded-lg" />
                    <Skeleton className="w-full h-16 rounded-lg" />
                  </div>
                ) : notesError ? (
                  <div className="text-center py-6">
                    <p className="text-red-500">
                      {notesError.message || "Failed to load notes."}
                    </p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No notes added yet.</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      doctor={note.author?.fullName || "Unknown Author"}
                      date={
                        note.createdAt
                          ? new Date(note.createdAt).toLocaleDateString()
                          : ""
                      }
                      text={note.content}
                      onDelete={() => {
                        setSelectedNoteId(note.id);
                        setIsDeleteNoteModalOpen(true);
                      }}
                    />
                  ))
                )}
              </TabPanel>

              <TabPanel className={"flex flex-col gap-2 md:gap-4"}>
                {requestsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="w-full h-32 rounded-lg" />
                    <Skeleton className="w-full h-32 rounded-lg" />
                    <Skeleton className="w-full h-32 rounded-lg" />
                  </div>
                ) : requestsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{requestsError.message}</p>
                  </div>
                ) : transformedRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      No requests found for this customer
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      {transformedRequests.map((item) => (
                        <PrescriptionRequestCard
                          key={item.id}
                          onApprove={() => handleApprove(item.id)}
                          onReject={() => handleReject(item.id)}
                          onAddNote={() => handleAddNote(item.id)}
                          onViewDetails={() => handleViewDetails(item.id)}
                          onChat={() => handleChat(item.id)}
                          cardVarient="Doctor"
                          {...item}
                        />
                      ))}
                    </div>
                    <Pagination
                      currentPage={requestsCurrentPage}
                      totalPages={requestsPageCount}
                      onPageChange={handleRequestsPageChange}
                    />
                  </>
                )}
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
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
            refetchRequests();
            setIsRejectModalOpen(false);
            setSelectedRequestId(null);
          } catch (error) {
            showErrorToast("Failed to deny request. Please try again.");
            console.error("Error denying request:", error);
          }
        }}
        isSubmitting={isDenying}
        itemTitle={
          transformedRequests.find((r) => r.id === selectedRequestId)
            ?.displayId || ""
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
            refetchRequests();
            setIsApproveModalOpen(false);
            setSelectedRequestId(null);
          } catch (error) {
            showErrorToast("Failed to approve request. Please try again.");
            console.error("Error approving request:", error);
          }
        }}
        isSubmitting={isApproving}
        itemTitle={
          transformedRequests.find((r) => r.id === selectedRequestId)
            ?.displayId || ""
        }
      />

      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onConfirm={async ({ note }) => {
          try {
            await createNote({
              variables: {
                notableId: params.id,
                notableType: "USER",
                content: note,
              },
            });
            await refetchNotes();
            showSuccessToast("Note added Successfully.");
          } catch (error) {
            showErrorToast("Failed to add note. Please try again.");
            console.error("Error creating note:", error);
            throw error;
          }
        }}
        isSubmitting={isCreatingNote}
        itemTitle={
          transformedRequests.find((r) => r.id === selectedRequestId)
            ?.displayId || ""
        }
      />

      <ProductRequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        itemTitle={
          transformedRequests.find((r) => r.id === selectedRequestId)
            ?.displayId || ""
        }
        requestData={transformedRequests.find(
          (r) => r.id === selectedRequestId
        )}
      />

      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        itemTitle={
          transformedRequests.find((r) => r.id === selectedRequestId)
            ?.displayId || ""
        }
        participantId={params.id}
        participantName={customer?.fullName || "Customer"}
      />

      <NewOrderModal
        isOpen={isOrderModalOpen}
        onCreateOrder={handleCreateOrder}
        onClose={() => setIsOrderModalOpen(false)}
        currentCustomer={{
          name: customer.fullName || "Unknown Customer",
          displayName: customer.fullName || "Unknown Customer",
        }}
        customers={[
          {
            name: customer.fullName || "Unknown Customer",
            displayName: customer.fullName || "Unknown Customer",
            email: customer.email,
          },
        ]}
      />

      <AppModal
        isOpen={isDeleteNoteModalOpen}
        onClose={() => {
          if (!isDeletingNote) {
            setIsDeleteNoteModalOpen(false);
            setSelectedNoteId(null);
          }
        }}
        onConfirm={async () => {
          if (!selectedNoteId) return;
          try {
            await deleteNote({
              variables: {
                id: selectedNoteId,
              },
            });
            await refetchNotes();
            showSuccessToast("Note deleted successfully.");
            setIsDeleteNoteModalOpen(false);
            setSelectedNoteId(null);
          } catch (error) {
            showErrorToast("Failed to delete note. Please try again.");
            console.error("Error deleting note:", error);
          }
        }}
        title="Delete Note?"
        confirmLabel={isDeletingNote ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        confimBtnDisable={isDeletingNote}
        confirmBtnVarient="danger"
        size="small"
        showFooter={true}
        disableCloseButton={isDeletingNote}
      >
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this note? This action cannot be
            undone.
          </p>
        </div>
      </AppModal>
    </div>
  );
}
