"use client";
import {
  ThemeButton,
  RequestApproveModal,
  NotificationListSkeleton,
  AppModal,
  Pagination,
} from "@/app/components";
import Tooltip from "@/app/components/ui/tooltip";
import {
  ChatIcon,
  PackageIcon,
  ReorderIcon,
  TickDouble,
  TrashBinIcon,
} from "@/icons";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { useMutation } from "@apollo/client";
import {
  APPROVE_ORDER_REQUEST,
  DELETE_NOTIFICATION,
  MARK_ALL_NOTIFICATIONS_AS_READ,
} from "@/lib/graphql/mutations";

interface NotificationUser {
  id: string;
}

export interface NotificationData {
  date: string;
  id: string;
  notificationType: string;
  senderName: string;
  read: boolean;
  doctorName: string;
  productNames: string[];
  user: NotificationUser;
  orderRequest: {
    id: string;
    status: string;
    displayId: string;
  };
  message: {
    content: string;
  };
  sender: {
    id: string;
  };
}

interface NotificationListProps {
  notifications: NotificationData[] | undefined;
  loading: boolean;
  error: Error | { message?: string } | undefined;
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  refetch: () => Promise<unknown>;
  userType?: "doctor" | "customer";
  onViewDetails?: (notification: NotificationData) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  error,
  pageCount,
  currentPage,
  onPageChange,
  refetch,
  userType = "doctor",
  onViewDetails,
}) => {
  const router = useRouter();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);

  const [approveOrderRequest, { loading: isApproving }] = useMutation(
    APPROVE_ORDER_REQUEST
  );

  const [deleteNotification, { loading: isDeleting }] =
    useMutation(DELETE_NOTIFICATION);

  const [markAllAsRead, { loading: isMarkingAllAsRead }] = useMutation(
    MARK_ALL_NOTIFICATIONS_AS_READ
  );

  const humanizeDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const handleApproveClick = (message: NotificationData) => {
    const requestId = message.orderRequest?.id;
    if (!requestId) {
      showErrorToast("Unable to find request details.");
      return;
    }
    setSelectedRequest(requestId);
    setIsApproveModalOpen(true);
  };

  const handleApproveConfirm = async ({
    doctorMessage,
  }: {
    doctorMessage: string;
  }) => {
    if (!selectedRequest) {
      showErrorToast("No request selected.");
      return;
    }
    try {
      await approveOrderRequest({
        variables: {
          requestId: selectedRequest,
          doctorMessage: doctorMessage || null,
        },
      });
      showSuccessToast("Patient request approved successfully.");
      await refetch();
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      showErrorToast("Failed to approve request. Please try again.");
      console.error("Error approving request:", error);
    }
  };

  const handleDeleteClick = (notificationId: string) => {
    setSelectedNotificationId(notificationId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedNotificationId) {
      showErrorToast("No notification selected.");
      return;
    }
    try {
      const result = await deleteNotification({
        variables: {
          notificationId: selectedNotificationId,
        },
      });
      if (result.data?.deleteNotification?.success) {
        showSuccessToast("Notification deleted successfully.");
        await refetch();
        setIsDeleteModalOpen(false);
        setSelectedNotificationId(null);
      } else {
        showErrorToast("Failed to delete notification.");
      }
    } catch (error) {
      showErrorToast("Failed to delete notification. Please try again.");
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllAsRead({
        variables: {
          clientMutationId: null,
        },
      });
      if (result.data?.markAllNotificationsAsRead?.success) {
        const updatedCount =
          result.data?.markAllNotificationsAsRead?.updatedCount || 0;
        showSuccessToast(
          `${updatedCount} notification${
            updatedCount !== 1 ? "s" : ""
          } marked as read.`
        );
        await refetch();
      } else {
        showErrorToast("Failed to mark all notifications as read.");
      }
    } catch (error) {
      showErrorToast(
        "Failed to mark all notifications as read. Please try again."
      );
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleViewDetails = (notification: NotificationData) => {
    if (onViewDetails) {
      onViewDetails(notification);
    } else if (userType === "doctor" && notification.sender?.id) {
      router.push(`/customers/${notification.sender.id}`);
    }
    // For customers, we might not need navigation or handle it differently
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-2 pt-2 mx-auto">
      <div className="flex justify-end">
        <button
          onClick={handleMarkAllAsRead}
          disabled={isMarkingAllAsRead}
          className="flex items-center gap-1 hover:bg-white cursor-pointer rounded-lg px-3 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TickDouble />{" "}
          {isMarkingAllAsRead ? "Marking..." : "Mark All as read"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-table">
        {error ? (
          <div className="p-6 md:p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <p className="text-red-600 font-medium text-sm md:text-base">
                Failed to load notifications
              </p>
              <p className="text-gray-600 text-xs md:text-sm">
                {error.message ||
                  "An error occurred while fetching notifications"}
              </p>
            </div>
          </div>
        ) : loading ? (
          <NotificationListSkeleton />
        ) : notifications && notifications.length > 0 ? (
          notifications.map((message: NotificationData) => (
            <div
              key={message.id}
              className="p-3 border-b border-mercury last:border-b-0 md:p-5 flex items-start gap-3 justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {message.notificationType === "reorder" ? (
                    <ReorderIcon />
                  ) : message.notificationType === "message_received" ? (
                    <ChatIcon />
                  ) : (
                    <PackageIcon />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <h2 className="text-sm md:text-lg text-gray-800 font-semibold">
                      {(() => {
                        switch (message.notificationType) {
                          case "order_request_created":
                            return <span>Request for a new product</span>;

                          case "order_request_approved":
                            return (
                              <span>
                                Dr. {message.doctorName} has been approved your
                                order
                              </span>
                            );

                          case "order_request_denied":
                            return (
                              <span>
                                Dr. {message.doctorName} has been rejected your
                                order.
                              </span>
                            );

                          case "message_received":
                            return (
                              <span>New message from {message.senderName}</span>
                            );

                          default:
                            return <span>New notification</span>;
                        }
                      })()}
                    </h2>
                    <span className="w-2 h-2 rounded-full bg-gray-300 block"></span>
                    <span className="text-gray-700 font-medium md:text-sm text-xs">
                      {humanizeDate(message.date)}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-gray-300 block"></span>
                    <span className="text-gray-800 font-normal md:text-sm text-xs">
                      {(message.notificationType === "message_received" ||
                        message.notificationType ===
                          "order_request_created") && (
                        <span className="font-semibold">
                          {message.senderName}
                        </span>
                      )}

                      {message.notificationType ===
                        "order_request_approved" && (
                        <span className="font-semibold">
                          {message.doctorName}
                        </span>
                      )}
                      {message.notificationType === "order_request_denied" && (
                        <span className="font-semibold">
                          {message.doctorName}
                        </span>
                      )}
                    </span>
                  </div>

                  <h2 className="text-xs md:text-sm text-gray-800">
                    {message.notificationType === "order_request_created" && (
                      <div>
                        A New Product request for &quot;
                        {message.productNames.map((product) => (
                          <span key={product}>{product}</span>
                        ))}
                        &quot; by
                        <span className="font-semibold">
                          {" "}
                          {message.senderName}
                        </span>
                        .
                      </div>
                    )}{" "}
                    {message.notificationType === "message_received" && (
                      <div>
                        <span>{message.senderName}</span> has sent you a
                        message.
                        <span className="font-semibold">
                          {" "}
                          &quot;
                          {message.message?.content}
                          &quot;
                        </span>
                      </div>
                    )}{" "}
                    {message.notificationType === "order_request_approved" && (
                      <div>
                        Dr. {message.doctorName} has been approved your order
                      </div>
                    )}
                    {message.notificationType === "order_request_denied" && (
                      <div>
                        Dr. {message.doctorName} has been rejected your order.
                      </div>
                    )}
                  </h2>

                  <div className="mt-2 flex items-center gap-2">
                    {userType === "doctor" && (
                      <ThemeButton
                        label="View Details"
                        size="medium"
                        variant="outline"
                        className="w-fit"
                        heightClass="h-9"
                        onClick={() => handleViewDetails(message)}
                      />
                    )}
                    {userType === "doctor" &&
                      message.notificationType !== "message_received" &&
                      message.orderRequest?.status === "pending" && (
                        <ThemeButton
                          label="Approve"
                          size="medium"
                          variant="success"
                          className="w-fit"
                          heightClass="h-9"
                          onClick={() => handleApproveClick(message)}
                        />
                      )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!message.read && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary block"></span>
                )}

                <Tooltip content="Delete">
                  <button
                    onClick={() => handleDeleteClick(message.id)}
                    className="cursor-pointer bg-white rounded p-1 hover:bg-red-100"
                  >
                    <TrashBinIcon />
                  </button>
                </Tooltip>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            No notifications found.
          </div>
        )}
      </div>

      {!loading && !error && notifications && notifications.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pageCount}
          onPageChange={onPageChange}
        />
      )}

      <RequestApproveModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          if (!isApproving) {
            setIsApproveModalOpen(false);
            setSelectedRequest(null);
          }
        }}
        onConfirm={handleApproveConfirm}
        isSubmitting={isApproving}
        itemTitle={
          selectedRequest
            ? notifications?.find(
                (n: NotificationData) => n.orderRequest?.id === selectedRequest
              )?.orderRequest?.displayId || ""
            : undefined
        }
      />

      <AppModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setSelectedNotificationId(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Notification?"
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        confimBtnDisable={isDeleting}
        confirmBtnVarient="danger"
        size="small"
        disableCloseButton={isDeleting}
      >
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this notification? This action
            cannot be undone.
          </p>
        </div>
      </AppModal>
    </div>
  );
};

export default NotificationList;
