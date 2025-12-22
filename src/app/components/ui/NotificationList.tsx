"use client";
import {
  ThemeButton,
  RequestApproveModal,
  RequestRejectModal,
  NotificationListSkeleton,
  AppModal,
  Pagination,
} from "@/app/components";
import ProductDetails from "@/app/components/ui/modals/ProductDetails";
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
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";

import { useMutation } from "@apollo/client";
import {
  APPROVE_ORDER_REQUEST,
  DENY_ORDER_REQUEST,
  DELETE_NOTIFICATION,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  MARK_NOTIFICATION_AS_READ,
} from "@/lib/graphql/mutations";

interface NotificationUser {
  id: string;
}

interface RequestedProductVariant {
  sku?: string | null;
}

interface RequestedProduct {
  id?: string;
  title?: string;
  description?: string;
  primaryImage?: string;
  productType?: string;
  vendor?: string;
  tags?: string[];
  variants?: RequestedProductVariant[] | null;
}

interface RequestedItem {
  title?: string;
  price?: string | number | null;
  product?: RequestedProduct | null;
}

interface ProductDetailsModalProduct {
  id: number;
  title: string;
  productForm: string;
  category: string;
  price: string;
  description: string;
  primaryImage?: string;
  tags?: string[];
  variants?: RequestedProductVariant[] | null;
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
    requestedItems?: RequestedItem[];
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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] =
    useState<ProductDetailsModalProduct | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);

  const [approveOrderRequest, { loading: isApproving }] = useMutation(
    APPROVE_ORDER_REQUEST
  );

  const [denyOrderRequest, { loading: isDenying }] =
    useMutation(DENY_ORDER_REQUEST);

  const [deleteNotification, { loading: isDeleting }] =
    useMutation(DELETE_NOTIFICATION);

  const [markAllAsRead, { loading: isMarkingAllAsRead }] = useMutation(
    MARK_ALL_NOTIFICATIONS_AS_READ
  );

  const [markNotificationAsRead, { loading: isMarkingAsRead }] = useMutation(
    MARK_NOTIFICATION_AS_READ
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

  const handleRejectClick = (message: NotificationData) => {
    const requestId = message.orderRequest?.id;
    if (!requestId) {
      showErrorToast("Unable to find request details.");
      return;
    }
    setSelectedRequest(requestId);
    setIsRejectModalOpen(true);
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

  const handleRejectConfirm = async ({ reason }: { reason: string }) => {
    if (!selectedRequest) {
      showErrorToast("No request selected.");
      return;
    }
    try {
      await denyOrderRequest({
        variables: {
          requestId: selectedRequest,
          doctorMessage: reason,
        },
      });
      showSuccessToast("Patient request denied successfully.");
      await refetch();
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      showErrorToast("Failed to deny request. Please try again.");
      console.error("Error denying request:", error);
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

        // Update Redux store to set unreadNotifications to false
        if (user) {
          dispatch(
            setUser({
              ...user,
              unreadNotifications: false,
            })
          );
        }

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

  const handleNotificationClick = async (notification: NotificationData) => {
    // Only mark as read if it's not already read
    if (!notification.read && !isMarkingAsRead) {
      try {
        const result = await markNotificationAsRead({
          variables: {
            notificationId: notification.id,
          },
        });
        if (result.data?.markNotificationAsRead?.success) {
          await refetch();
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        // Don't show error toast for this as it's a background operation
      }
    }
  };

  const handleViewDetails = (notification: NotificationData) => {
    // For request-related notifications, skip modal and navigate directly to requests tab
    if (
      notification.orderRequest?.id &&
      userType === "doctor" &&
      notification.sender?.id
    ) {
      router.push(`/customers/${notification.sender.id}?tab=requests`);
      return;
    }

    // For message notifications, navigate to chat tab
    if (notification.notificationType === "message_received") {
      if (onViewDetails) {
        onViewDetails(notification);
        return;
      }
      if (userType === "doctor" && notification.sender?.id) {
        router.push(`/customers/${notification.sender.id}?tab=chat`);
        return;
      }
    }

    // For other cases, try modal first (but this shouldn't happen for request notifications)
    const handledByModal = tryOpenProductDetails(notification);
    if (handledByModal) {
      return;
    }

    if (onViewDetails) {
      onViewDetails(notification);
      return;
    }

    // Fallback navigation
    if (userType === "doctor" && notification.sender?.id) {
      let tab = "";
      if (notification.notificationType === "message_received") {
        tab = "?tab=chat";
      } else if (notification.orderRequest?.id) {
        tab = "?tab=requests";
      }
      router.push(`/customers/${notification.sender.id}${tab}`);
    }
  };

  const tryOpenProductDetails = (message: NotificationData): boolean => {
    if (
      message.notificationType !== "order_request_created" &&
      message.notificationType !== "reorder_created"
    ) {
      return false;
    }

    const requestedItem = message.orderRequest?.requestedItems?.[0];
    const product = requestedItem?.product;

    if (!requestedItem || !product) {
      showErrorToast("Product details unavailable for this request.");
      return false;
    }

    const numericPrice = requestedItem.price
      ? Number(requestedItem.price)
      : null;

    const modalProduct: ProductDetailsModalProduct = {
      id: product.id ? Number(product.id) || 0 : 0,
      title: product.title || requestedItem.title || "Requested Product",
      productForm: product.productType || "N/A",
      category: product.vendor || "N/A",
      price:
        numericPrice && !Number.isNaN(numericPrice)
          ? `$${numericPrice.toFixed(2)}`
          : requestedItem.price?.toString() || "N/A",
      description: product.description || "",
      primaryImage: product.primaryImage,
      tags: product.tags || [],
      variants: product.variants || [],
    };

    setSelectedProductDetails(modalProduct);
    setIsProductModalOpen(true);
    return true;
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
              onClick={() => handleNotificationClick(message)}
              className={`p-3 border-b border-mercury last:border-b-0 md:p-5 flex items-start gap-3 justify-between transition-colors ${
                !message.read ? "cursor-pointer hover:bg-gray-50" : ""
              }`}
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
                          case "reorder_created":
                            return <span>New reorder request</span>;

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
                        message.notificationType === "order_request_created" ||
                        message.notificationType === "reorder_created") && (
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
                    {message.notificationType === "reorder_created" && (
                      <div>
                        Reorder Product request for &quot;
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
                        {/* {userType === "doctor" && (
                          <button
                            type="button"
                            className="ml-2 text-primary font-semibold underline"
                            onClick={() => handleViewDetails(message)}
                          >
                            View Details
                          </button>
                        )} */}
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

                  <div
                    className="mt-2 flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                        <>
                          <ThemeButton
                            label="Approve"
                            size="medium"
                            variant="success"
                            className="w-fit"
                            heightClass="h-9"
                            onClick={() => handleApproveClick(message)}
                          />
                          <ThemeButton
                            label="Decline"
                            size="medium"
                            variant="danger"
                            className="w-fit"
                            heightClass="h-9"
                            onClick={() => handleRejectClick(message)}
                          />
                        </>
                      )}
                    {userType === "customer" &&
                      message.notificationType !== "message_received" &&
                      message.orderRequest?.status === "approved" && (
                        <>
                          <ThemeButton
                            label="See Details"
                            size="medium"
                            variant="filled"
                            className="w-fit"
                            heightClass="h-9"
                            onClick={() => router.push(`/pending-payments`)}
                          />
                        </>
                      )}
                    {userType === "customer" &&
                      message.notificationType !== "message_received" &&
                      message.orderRequest?.status === "denied" && (
                        <>
                          <ThemeButton
                            label="See Details"
                            size="medium"
                            variant="filled"
                            className="w-fit"
                            heightClass="h-9"
                            onClick={() =>
                              router.push(`/customer-requests?tab=denied`)
                            }
                          />
                        </>
                      )}
                    {userType === "customer" &&
                      message.notificationType == "message_received" && (
                        <>
                          <ThemeButton
                            label="Start Chat"
                            size="medium"
                            variant="filled"
                            className="w-fit"
                            heightClass="h-9"
                            onClick={() => router.push(`/chat`)}
                          />
                        </>
                      )}
                  </div>
                </div>
              </div>
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
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

      <RequestRejectModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          if (!isDenying) {
            setIsRejectModalOpen(false);
            setSelectedRequest(null);
          }
        }}
        onConfirm={handleRejectConfirm}
        isSubmitting={isDenying}
        itemTitle={
          selectedRequest
            ? notifications?.find(
                (n: NotificationData) => n.orderRequest?.id === selectedRequest
              )?.orderRequest?.displayId || ""
            : undefined
        }
      />

      <ProductDetails
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProductDetails(null);
        }}
        product={selectedProductDetails}
        onClick={() => {
          setIsProductModalOpen(false);
          setSelectedProductDetails(null);
        }}
        showActionButton={false}
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
