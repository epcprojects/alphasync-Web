"use client";
import {
  ChatMessage,
  NoteCard,
  QuickTemplates,
  ThemeButton,
  CustomerOrderHistroyView,
  PrescriptionRequestCard,
  RequestRejectModal,
  Loader,
  Skeleton,
} from "@/app/components";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  BubbleChatIcon,
  NoteIcon,
  PackageOutlineIcon,
  PlusIcon,
  RequestTabIcon,
} from "@/icons";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { orders } from "../../../../../public/data/orders";
import ReactPaginate from "react-paginate";
import { PrecriptionDATA } from "../../../../../public/data/PrescriptionRequest";
import AddNoteModal from "@/app/components/ui/modals/AddNoteModal";
import ProductRequestDetailModal from "@/app/components/ui/modals/ProductRequestDetailModal";
import ChatModal from "@/app/components/ui/modals/ChatModal";
import NewOrderModal from "@/app/components/ui/modals/NewOrderModal";
import CustomerProfileHeaderCard from "@/app/components/ui/cards/CustomerProfileHeaderCard";
import { useQuery } from "@apollo/client/react";
import { FETCH_CUSTOMER } from "@/lib/graphql/queries";
import { UserAttributes } from "@/lib/graphql/attributes";

// Interface for GraphQL response
interface FetchUserResponse {
  fetchUser: {
    user: UserAttributes;
  };
}

export default function CustomerDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // GraphQL query to fetch customer data
  const { data, loading, error } = useQuery<FetchUserResponse>(FETCH_CUSTOMER, {
    variables: {
      id: params.id,
    },
    skip: !params.id,
    fetchPolicy: "network-only",
  });

  const customer = data?.fetchUser?.user;

  const itemsPerPage = 10;

  const initialPage = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const pageCount = Math.ceil(orders.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = orders.slice(offset, offset + itemsPerPage);
  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const [messages, setMessages] = useState<
    { sender: string; time: string; text: string; isUser: boolean }[]
  >([]);
  const [input, setInput] = useState("");
  const [toggle, setToggle] = useState(true);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
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
    setInput("");
  };

  const handleApprove = (title: string) => {
    showSuccessToast("Patient request approved successfully.");
    console.log(title);
  };

  const handleReject = (title: string) => {
    setIsRejectModalOpen(true);
    console.log(title);
  };

  const handleAddNote = (title: string) => {
    setIsNoteModalOpen(true);
    console.log(title);
  };

  const handleCreateOrder = (data: {
    customer: string;
    items: { product: string; quantity: number; price: number }[];
    totalAmount: number;
  }) => {
    console.log("Final Order Data:", data);
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
          totalOrders={8} // TODO: Get from orders query
          statusActive={customer.status === "active"}
          lastOrder="1/15/2024" // TODO: Get from orders query
          dob={customer.dateOfBirth || ""}
          onQuickChat={() => setSelectedIndex(1)}
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
                      onRowClick={() => router.push(`/orders/${order.orderId}`)}
                      key={order.orderId}
                      order={order}
                      onViewOrderDetails={() =>
                        router.push(`/orders/${order.orderId}`)
                      }
                    />
                  ))}
                </div>
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
                          <span className="hidden md:inline-block">
                            Previous
                          </span>
                        </span>
                      }
                      onPageChange={handlePageChange}
                      pageRangeDisplayed={3}
                      marginPagesDisplayed={1}
                      pageCount={pageCount}
                      forcePage={currentPage}
                      pageLinkClassName="px-4 py-2 rounded-lg text-gray-500 h-11 w-11 leading-8 text-center hover:bg-gray-100 cursor-pointer  hidden md:block"
                      containerClassName="flex items-center relative w-full justify-center gap-2 px-3 md:px-4 py-2 md:py-3  h-12 md:h-full rounded-2xl bg-white shadow-table"
                      pageClassName=" rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
                      activeClassName="bg-gray-200 text-gray-900 font-medium text-gray-700"
                      previousClassName="md:px-4 md:py-2 rounded-full  absolute left-0 bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
                      nextClassName="md:px-4 md:py-2 rounded-full bg-gray-50  absolute end-0 border text-gray-600 border-gray-200 hover:bg-gray-100 cursor-pointer"
                      breakClassName="px-3 py-1 font-semibold text-gray-400"
                    />

                    <h2 className="absolute md:hidden text-gravel font-medium text-sm">
                      Page {currentPage + 1} of {pageCount}
                    </h2>
                  </div>
                )}
              </TabPanel>
              <TabPanel className={"flex flex-col gap-1 md:gap-3"}>
                <div className="rounded-2xl overflow-hidden flex flex-col gap-2 border border-gray-200 p-1.5 md:p-3 max-h-[470px]  min-h-[470px]">
                  <QuickTemplates
                    templates={[
                      "Your prescription is ready",
                      "Please schedule a follow-up",
                      "Lab results are available",
                      "We have updated your records",
                    ]}
                  />

                  <div
                    className="flex-1 flex flex-col gap-2 overflow-y-auto h-full"
                    ref={chatRef}
                  >
                    {messages.map((msg, i) => (
                      <ChatMessage
                        key={i}
                        sender={msg.sender}
                        time={msg.time}
                        isUser={msg.isUser}
                        message={msg.text}
                      />
                    ))}
                    <div ref={messagesEndRef}></div>
                  </div>
                </div>
                <div className="w-full relative flex items-center">
                  <input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                    className="border border-gray-200 h-12 rounded-full w-full outline-none focus:ring focus:ring-gray-200 placeholder:text-gray-400 ps-4 pe-20 bg-gray-50 text-sm md:text-base"
                  />
                  <ThemeButton
                    label="Send"
                    heightClass="h-10"
                    className="absolute end-1"
                    onClick={() => handleSend(input)}
                  />
                </div>
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
                <NoteCard
                  doctor="Dr. Smith"
                  date="1/15/2024"
                  text="Allergic to penicillin. Prefers generic medications when available."
                  onDelete={() => showSuccessToast("Note Deleted Successfully")}
                />
                <NoteCard
                  doctor="Dr. Lee"
                  date="2/10/2024"
                  text="Patient reports occasional headaches. Recommended hydration and regular sleep."
                  onDelete={() => showSuccessToast("Note Deleted Successfully")}
                />
                <NoteCard
                  doctor="Dr. Brown"
                  date="3/05/2024"
                  text="History of seasonal allergies. Advised over-the-counter antihistamines during spring."
                  onDelete={() => showSuccessToast("Note Deleted Successfully")}
                />
              </TabPanel>

              <TabPanel className={"flex flex-col gap-2 md:gap-4"}>
                {PrecriptionDATA.map((item) => (
                  <PrescriptionRequestCard
                    key={item.id}
                    onApprove={() => handleApprove(item.title)}
                    onReject={() => handleReject(item.title)}
                    onAddNote={() => handleAddNote(item.title)}
                    onViewDetails={() => {
                      setIsDetailModalOpen(true);
                    }}
                    onChat={() => {
                      setIsChatModalOpen(true);
                    }}
                    {...item}
                  />
                ))}
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>

      <RequestRejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={(reason) => {
          showErrorToast("Patient request denied.");
          console.log(reason);
        }}
        itemTitle="ORD-004"
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

      <ProductRequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        itemTitle="REQ-001"
      />

      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        itemTitle="REQ-001"
        messages={messages}
        onSend={(msg) => {
          handleSend(msg);
        }}
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
    </div>
  );
}
