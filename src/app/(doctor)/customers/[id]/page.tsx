"use client";
import {
  ChatMessage,
  NoteCard,
  QuickTemplates,
  ThemeButton,
  CustomerOrderHistroyView,
  PrescriptionRequestCard,
  RequestRejectModal,
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
import { getInitials } from "@/lib/helpers";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { orders } from "../../../../../public/data/orders";
import ReactPaginate from "react-paginate";
import { PrecriptionDATA } from "../../../../../public/data/PrescriptionRequest";
import AddNoteModal from "@/app/components/ui/modals/AddNoteModal";
import ProductRequestDetailModal from "@/app/components/ui/modals/ProductRequestDetailModal";
import ChatModal from "@/app/components/ui/modals/ChatModal";
import NewOrderModal from "@/app/components/ui/modals/NewOrderModal";

export default function CustomerDetail() {
  const router = useRouter();
  // const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const itemsPerPage = 9;

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
        <div className="p-3 md:p-6 flex items-center justify-between gap-3 md:gap-5">
          <div className="flex items-start gap-3 md:gap-5">
            <div className="rounded-full h-10 w-10 text-red-500 bg-red-100 text-3xl font-medium flex items-center justify-center shrink-0 md:h-19 md:w-19">
              {getInitials("John Smith")}
              {/* <Image
                alt=""
                width={256}
                height={256}
                src={"/images/arinaProfile.png"}
                className="rounded-full w-full h-full"
              /> */}
            </div>
            <div className="flex gap-3 md:gap-6 justify-between flex-col ">
              <div className="flex items-center gap-1 md:gap-2">
                <h2 className="text-slate-900 text-sm md:text-lg font-semibold">
                  John Smith
                </h2>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium bg-green-50 text-green-700 border border-green-200`}
                >
                  Active
                </span>
              </div>

              <div className="flex items-center">
                <div className="border-r pe-3 md:pe-5 h border-gray-200">
                  <h2 className="text-xs md:text-sm text-gray-500 ">Email:</h2>
                  <h3 className="text-xs md:text-sm text-gray-800 font-medium">
                    john.smith@email.com
                  </h3>
                </div>

                <div className="border-r px-3 md:px-5 h border-gray-200">
                  <h2 className="text-xs md:text-sm text-gray-500 ">Phone:</h2>
                  <h3 className="text-xs md:text-sm text-gray-800 font-medium">
                    (555) 123-4567
                  </h3>
                </div>

                <div className="border-r px-3 md:px-5 h border-gray-200">
                  <h2 className="text-xs md:text-sm text-gray-500 ">
                    Date of Birth:
                  </h2>
                  <h3 className="text-xs md:text-sm text-gray-800 font-medium">
                    3/15/1985
                  </h3>
                </div>

                <div className="border-r px-3 md:px-5 h border-gray-200">
                  <h2 className="text-xs md:text-sm text-gray-500 ">
                    Total Orders:
                  </h2>
                  <h3 className="text-xs md:text-sm text-gray-800 font-medium">
                    08
                  </h3>
                </div>

                <div className=" ps-3 md:ps-5">
                  <h2 className="text-xs md:text-sm text-gray-500 ">
                    Last Order:
                  </h2>
                  <h3 className="text-xs md:text-sm text-gray-800 font-medium">
                    1/15/2024
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            <ThemeButton
              label="Create Order"
              onClick={() => {
                setIsOrderModalOpen(true);
              }}
              icon={<PlusIcon />}
              variant="primaryOutline"
              heightClass="h-10"
            />

            <ThemeButton
              label="Quick Chat"
              onClick={() => setSelectedIndex(1)}
              icon={<BubbleChatIcon />}
              heightClass="h-10"
            />
          </div>
        </div>

        <div className=" ">
          <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <TabList className="flex items-center border-t border-b bg-gray-50 border-b-mercury border-t-mercury px-4 md:px-6">
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
                  className="flex items-center gap-1 md:gap-2 text-xs md:text-sm outline-none border-b-2 border-b-gray-50 data-selected:border-b-primary data-selected:text-primary font-semibold cursor-pointer text-gray-500 md:py-4 md:px-6"
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
                      onRowClick={() =>
                        router.push(`/customers/${order.orderId}`)
                      }
                      key={order.orderId}
                      order={order}
                      onViewCustomer={() =>
                        router.push(`/customers/${order.orderId}`)
                      }
                    />
                  ))}
                </div>
                {currentItems.length > 0 && (
                  <div className="w-full flex items-center justify-center">
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel={
                        <span className="flex items-center justify-center h-9 md:w-full md:h-full w-9 select-none font-semibold text-xs md:text-sm text-gray-600 gap-1">
                          <span className="hidden md:inline-block">Next</span>
                          <span className="block mb-0.5 rotate-180">
                            <ArrowLeftIcon />
                          </span>
                        </span>
                      }
                      previousLabel={
                        <span className="flex items-center  h-9 md:w-full md:h-full w-9 justify-center select-none font-semibold text-xs md:text-sm text-gray-600 gap-1">
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
                      pageLinkClassName="px-4 py-2 rounded-lg text-gray-600 h-11 w-11 leading-8 text-center hover:bg-gray-100 cursor-pointer  hidden md:block"
                      containerClassName="flex items-center relative w-full justify-center gap-2 px-3 md:px-4 py-2 md:py-3  h-12 md:h-full rounded-2xl bg-white"
                      pageClassName=" rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
                      activeClassName="bg-gray-200 text-gray-900 font-medium"
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
                    className="flex-1 flex flex-col gap-2 overflow-y-scroll h-full"
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
                    onClick={() => {}}
                  />
                </div>
                <NoteCard
                  doctor="Dr. Smith"
                  date="1/15/2024"
                  text="Allergic to penicillin. Prefers generic medications when available."
                  onDelete={() => console.log("Delete clicked")}
                />
                <NoteCard
                  doctor="Dr. Lee"
                  date="2/10/2024"
                  text="Patient reports occasional headaches. Recommended hydration and regular sleep."
                  onDelete={() => console.log("Delete clicked")}
                />
                <NoteCard
                  doctor="Dr. Brown"
                  date="3/05/2024"
                  text="History of seasonal allergies. Advised over-the-counter antihistamines during spring."
                  onDelete={() => console.log("Delete clicked")}
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
        currentCustomer={{ name: "John Doe", displayName: "John Doe" }}
        customers={[
          {
            name: "John Smith",
            displayName: "John Smith",
          },
          {
            name: "Sarah J",
            displayName: "Sarah J",
            email: "Sarah.smith@email.com",
          },
          {
            name: "Emily Chen",
            displayName: "Emily Chen",
            email: "Emily.smith@email.com",
          },
        ]}
        products={[
          {
            name: "BPC-157",
            displayName: "BPC-157",
          },
          {
            name: "TB-500",
            displayName: "TB-500",
          },
          {
            name: "CJC-1295",
            displayName: "CJC-1295",
          },
        ]}
      />
    </div>
  );
}
