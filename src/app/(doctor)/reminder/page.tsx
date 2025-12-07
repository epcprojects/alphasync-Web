"use client";

import { ReminderFilledIcon, SearchIcon } from "@/icons";
import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import RefillView from "@/app/components/ui/cards/RefillView";
import { useIsMobile } from "@/hooks/useIsMobile";
import ChatModal from "@/app/components/ui/modals/ChatModal";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { EmptyState, Loader } from "@/app/components";
import { useMutation, useQuery } from "@apollo/client";
import { ORDER_REMINDERS } from "@/lib/graphql/queries";
import { REORDER_ORDER, UPDATE_AUTO_REORDER } from "@/lib/graphql/mutations";
import { differenceInCalendarDays, format } from "date-fns";
import Pagination from "@/app/components/ui/Pagination";
import ReminderListSkeleton from "@/app/components/ui/ReminderListSkeleton";

const REMINDER_DATE_FORMAT = "MM/dd/yyyy";

type ReminderCard = {
  id: number;
  orderId: string;
  customer: string;
  product: string;
  lastOrder: string;
  daysSince: number;
  autoReorder: boolean;
};

type OrderReminderItem = {
  product?: {
    title?: string | null;
  } | null;
};

type OrderReminderNode = {
  id: string;

  createdAt?: string | null;
  autoReorder?: boolean | null;
  patient?: {
    id?: string | null;
    fullName?: string | null;
    address?: string | null;
  } | null;
  orderItems?: OrderReminderItem[] | null;
  daysSinceCreated?: number | null;
};

type OrderRemindersResponse = {
  orderReminders: {
    allData: OrderReminderNode[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
};

const mapReminderToCard = (
  reminder: OrderReminderNode,
  fallbackIndex: number
): ReminderCard => {
  const parsedId = Number(reminder.id);
  const id = Number.isNaN(parsedId) ? fallbackIndex + 1 : parsedId;

  const lastOrderDate = reminder.createdAt
    ? new Date(reminder.createdAt)
    : null;
  const hasValidDate =
    !!lastOrderDate && !Number.isNaN(lastOrderDate.getTime());
  const lastOrder = hasValidDate
    ? format(lastOrderDate as Date, REMINDER_DATE_FORMAT)
    : "—";

  const computedDaysSince = hasValidDate
    ? Math.max(differenceInCalendarDays(new Date(), lastOrderDate as Date), 0)
    : 0;
  const daysSince =
    typeof reminder.daysSinceCreated === "number"
      ? reminder.daysSinceCreated
      : computedDaysSince;

  const customer =
    reminder.patient?.fullName?.trim() ||
    reminder.patient?.address?.trim() ||
    reminder.id;

  const product = reminder.orderItems?.[0]?.product?.title?.trim() || "—";
  const autoReorder = Boolean(reminder.autoReorder);

  return {
    id,
    orderId: reminder.id,
    customer,
    product,
    lastOrder,
    daysSince,
    autoReorder,
  };
};

function ReminderContent() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const itemsPerPage = 10;

  const [currentPage, setCurrentPage] = useState(0);
  const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(
    null
  );
  const [updatingAutoOrderId, setUpdatingAutoOrderId] = useState<string | null>(
    null
  );

  const { data, loading, error, refetch } = useQuery<OrderRemindersResponse>(
    ORDER_REMINDERS,
    {
      variables: {
        page: currentPage + 1,
        perPage: itemsPerPage,
        search: search.trim() || undefined,
      },
      fetchPolicy: "network-only",
    }
  );

  const [reorderOrderMutation] = useMutation(REORDER_ORDER);
  const [updateAutoReorderMutation] = useMutation(UPDATE_AUTO_REORDER);

  const remindersData = data?.orderReminders?.allData ?? [];
  const pageCount = data?.orderReminders?.totalPages ?? 0;
  const totalReminders = data?.orderReminders?.count ?? 0;

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected);
  };

  const handleReorder = async (orderId: string) => {
    try {
      setReorderingOrderId(orderId);
      await reorderOrderMutation({
        variables: { orderId },
      });
      showSuccessToast("Product Reordered Successfully");
      await refetch();
    } catch (mutationError) {
      console.error(mutationError);
      showErrorToast("Unable to reorder. Please try again.");
    } finally {
      setReorderingOrderId(null);
    }
  };

  const handleAutoReorder = async (orderId: string, nextState: boolean) => {
    try {
      setUpdatingAutoOrderId(orderId);
      await updateAutoReorderMutation({
        variables: { orderId, autoReorder: nextState },
      });
      showSuccessToast(
        nextState ? "Auto Reorder Enabled" : "Auto Reorder Disabled"
      );
      await refetch();
    } catch (mutationError) {
      console.error(mutationError);
      showErrorToast("Unable to update auto reorder. Please try again.");
    } finally {
      setUpdatingAutoOrderId(null);
    }
  };

  const isMobile = useIsMobile();
  const shouldShowPagination = !loading && !error && pageCount > 1;

  const handleContactClick = (
    patient: OrderReminderNode["patient"],
    fallbackName: string
  ) => {
    const participantId =
      (patient?.id && String(patient.id)) || "reminder-patient";
    const participantName =
      patient?.fullName?.trim() || fallbackName || "Patient";
    setSelectedParticipant({ id: participantId, name: participantName });
    setIsChatModalOpen(true);
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="flex items-center text-primary justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-lg md:w-11 md:h-11">
            <ReminderFilledIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <h2 className="text-black font-semibold text-lg md:text-3xl">
            Customers Due for Refills
          </h2>
          <div className="px-3 py-1 rounded-full bg-white border border-indigo-200">
            <p className="text-sm font-medium text-primary whitespace-nowrap">
              {loading ? "..." : totalReminders}
            </p>
          </div>
        </div>

        <div className="flex items-center relative w-full lg:w-fit  bg-white  p-2 rounded-full shadow-table">
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
            className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-sm md:text-base md:py-2 focus:bg-white bg-gray-100 w-full  md:min-w-80 outline-none focus:ring focus:ring-gray-200 rounded-full"
          />
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-1">
          <div className="hidden sm:grid sm:grid-cols-[4fr_2fr_1fr_1fr_3fr] lg:grid-cols-[1fr_1fr_1fr_1fr_400px] text-black font-medium text-xs gap-4 px-2 py-2.5 bg-white rounded-xl shadow-table">
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

          {loading ? (
            <ReminderListSkeleton count={3} />
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-sm text-red-500">{error.message}</p>
            </div>
          ) : (
            remindersData.map((reminderNode, index) => {
              const reminderCard = mapReminderToCard(reminderNode, index);
              const isReorderLoading =
                reorderingOrderId === reminderCard.orderId;
              const isAutoReorderLoading =
                updatingAutoOrderId === reminderCard.orderId;
              return (
                <RefillView
                  onRowClick={() => router.push(`/orders/${reminderNode.id}`)}
                  key={`${reminderNode.id}-${index}`}
                  order={reminderCard}
                  isReorderLoading={isReorderLoading}
                  isAutoReorderLoading={isAutoReorderLoading}
                  onAutoReOrderClick={(nextState) =>
                    handleAutoReorder(reminderCard.orderId, nextState)
                  }
                  onContactClick={() =>
                    handleContactClick(
                      reminderNode.patient,
                      reminderCard.customer
                    )
                  }
                  onReOrderClick={() => handleReorder(reminderCard.orderId)}
                />
              );
            })
          )}
        </div>
        <div className="flex justify-center flex-col gap-2 md:gap-6 ">
          {!loading && !error && remindersData.length < 1 && (
            <EmptyState mtClasses="md:-mt-4 -mt-4  " />
          )}

          {shouldShowPagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={pageCount}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        itemTitle=""
        participantId={selectedParticipant?.id || ""}
        participantName={selectedParticipant?.name || ""}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <ReminderContent />
    </Suspense>
  );
}
