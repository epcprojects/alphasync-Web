"use client";
import {
  ChatIcon,
  CrossIcon,
  ReminderIcon,
  PackageIcon,
  ReorderIcon,
  TrashBinIcon,
} from "@/icons";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
  Dialog,
  DialogPanel,
} from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import Link from "next/link";
import { useMutation, useLazyQuery } from "@apollo/client";
import { ALL_NOTIFICATIONS } from "@/lib/graphql/queries";
import { NotificationData } from "./NotificationList";
import { useAppSelector } from "@/lib/store/hooks";
import Tooltip from "./tooltip";
import ThemeButton from "./buttons/ThemeButton";
import { useRouter } from "next/navigation";
import {
  RequestApproveModal,
  RequestRejectModal,
  AppModal,
} from "@/app/components";
import {
  APPROVE_ORDER_REQUEST,
  DENY_ORDER_REQUEST,
  DELETE_NOTIFICATION,
} from "@/lib/graphql/mutations";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

interface NotificationsProps {
  userType?: "doctor" | "customer";
}

export default function Notifications({ userType }: NotificationsProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);

  // Determine user type from user data if not provided
  const currentUserType =
    userType ||
    (user?.userType?.toLowerCase() === "customer" ||
    user?.userType?.toLowerCase() === "patient"
      ? "customer"
      : "doctor");

  const [fetchNotifications, { data, loading, error }] = useLazyQuery(
    ALL_NOTIFICATIONS,
    {
      fetchPolicy: "network-only",
    }
  );

  const [approveOrderRequest, { loading: isApproving }] = useMutation(
    APPROVE_ORDER_REQUEST
  );

  const [denyOrderRequest, { loading: isDenying }] =
    useMutation(DENY_ORDER_REQUEST);

  const [deleteNotification, { loading: isDeleting }] =
    useMutation(DELETE_NOTIFICATION);

  const notifications = data?.allNotifications?.allData || [];

  // Fetch notifications when mobile dialog opens
  useEffect(() => {
    if (open && isMobile) {
      fetchNotifications({
        variables: {
          page: 1,
          perPage: 4,
        },
      });
    }
  }, [open, isMobile, fetchNotifications]);

  const handleViewDetails = (notification: NotificationData) => {
    if (currentUserType === "doctor" && notification.sender?.id) {
      // Determine which tab to open based on notification type
      let tab = "";
      if (notification.notificationType === "message_received") {
        tab = "?tab=chat";
      } else if (
        notification.notificationType === "order_request_created" ||
        notification.notificationType === "reorder_created"
      ) {
        tab = "?tab=requests";
      }
      router.push(`/customers/${notification.sender.id}${tab}`);
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
      // Close modal and reset state immediately after successful mutation
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
      // Refetch notifications after closing modal
      await fetchNotifications({
        variables: {
          page: 1,
          perPage: 4,
        },
      });
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
      // Close modal and reset state immediately after successful mutation
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      // Refetch notifications after closing modal
      await fetchNotifications({
        variables: {
          page: 1,
          perPage: 4,
        },
      });
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
        await fetchNotifications({
          variables: {
            page: 1,
            perPage: 4,
          },
        });
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

  const getNotificationTitle = (message: NotificationData) => {
    switch (message.notificationType) {
      case "order_request_created":
        return "Request for a new product";
      case "reorder_created":
        return "New reorder request";
      case "order_request_approved":
        return `Dr. ${message.doctorName} has approved your order`;
      case "order_request_denied":
        return `Dr. ${message.doctorName} has rejected your order`;
      case "message_received":
        return `New message from ${message.senderName}`;
      default:
        return "New notification";
    }
  };

  const getNotificationDescription = (message: NotificationData) => {
    if (
      message.notificationType === "order_request_created" ||
      message.notificationType === "reorder_created"
    ) {
      return (
        <div>
          <span>{message.senderName} </span>has requested a new product
          <span className="font-semibold">
            {" "}
            &quot;
            {message.productNames.map((product) => (
              <span key={product}>{product}</span>
            ))}
            &quot;
          </span>
          .
        </div>
      );
    } else if (message.notificationType === "message_received") {
      return (
        <div>
          <span>{message.senderName}</span> has sent you a message.
          <span className="font-semibold">
            {" "}
            &quot;
            {message.message?.content}
            &quot;
          </span>
        </div>
      );
    } else if (message.notificationType === "order_request_approved") {
      return <div>Dr. {message.doctorName} has approved your order</div>;
    } else if (message.notificationType === "order_request_denied") {
      return <div>Dr. {message.doctorName} has rejected your order.</div>;
    }
    return null;
  };

  const renderList = (
    limit?: number,
    closeDialog?: () => void,
    setOpenState?: (value: boolean) => void
  ) => {
    if (loading || (!data && !error)) {
      return (
        <div className="p-4 text-center text-gray-500 text-sm">
          Loading notifications...
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-center text-red-600 text-sm">
          Failed to load notifications
        </div>
      );
    }

    if (!notifications || notifications.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 text-sm">
          No notifications found.
        </div>
      );
    }

    const displayNotifications = notifications.slice(
      0,
      limit ?? notifications.length
    );

    return (
      <div className="space-y-3 lg:space-y-4">
        {displayNotifications.map((n: NotificationData) => (
          <div
            key={n.id}
            className="pb-2.5 lg:pb-4 border-b border-mercury last:border-b-0"
          >
            <div className="flex items-start gap-2 justify-between">
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  {n.notificationType === "reorder" ||
                  n.notificationType === "reorder_request" ? (
                    <ReorderIcon />
                  ) : n.notificationType === "message_received" ? (
                    <ChatIcon />
                  ) : (
                    <PackageIcon />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="text-xs md:text-base text-gray-800 font-semibold">
                    {getNotificationTitle(n)}
                  </h2>

                  <h2 className="text-xs md:text-sm text-gray-800">
                    {getNotificationDescription(n)}
                  </h2>

                  {currentUserType === "doctor" && (
                    <div className="mt-2 flex items-center gap-2">
                      <ThemeButton
                        label="View Details"
                        size={isMobile ? "small" : "medium"}
                        variant="outline"
                        className="w-fit"
                        heightClass={isMobile ? "h-8" : "h-9"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenState?.(false);
                          closeDialog?.();
                          handleViewDetails(n);
                        }}
                      />
                      {n.notificationType !== "message_received" &&
                        n.orderRequest?.status === "pending" && (
                          <>
                            <ThemeButton
                              label="Approve"
                              size={isMobile ? "small" : "medium"}
                              variant="success"
                              className="w-fit"
                              heightClass={isMobile ? "h-8" : "h-9"}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenState?.(false);
                                closeDialog?.();
                                handleApproveClick(n);
                              }}
                            />
                            <ThemeButton
                              label="Decline"
                              size={isMobile ? "small" : "medium"}
                              variant="danger"
                              className="w-fit"
                              heightClass={isMobile ? "h-8" : "h-9"}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenState?.(false);
                                closeDialog?.();
                                handleRejectClick(n);
                              }}
                            />
                          </>
                        )}
                    </div>
                  )}
                  {currentUserType === "customer" &&
                    n.notificationType !== "message_received" &&
                    n.orderRequest?.status === "approved" && (
                      <div className="mt-2 flex items-center gap-2">
                        <ThemeButton
                          label="See Details"
                          size={isMobile ? "small" : "medium"}
                          variant="filled"
                          className="w-fit"
                          heightClass={isMobile ? "h-8" : "h-9"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenState?.(false);
                            closeDialog?.();
                            setTimeout(() => {
                              router.push(`/pending-payments`);
                            }, 0);
                          }}
                        />
                      </div>
                    )}
                  {currentUserType === "customer" &&
                    n.notificationType !== "message_received" &&
                    n.orderRequest?.status === "denied" && (
                      <div className="mt-2 flex items-center gap-2">
                        <ThemeButton
                          label="See Details"
                          size={isMobile ? "small" : "medium"}
                          variant="filled"
                          className="w-fit"
                          heightClass={isMobile ? "h-8" : "h-9"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenState?.(false);
                            closeDialog?.();
                            setTimeout(() => {
                              router.push(`/customer-requests?tab=denied`);
                            }, 0);
                          }}
                        />
                      </div>
                    )}
                  {currentUserType === "customer" &&
                    n.notificationType === "message_received" && (
                      <div className="mt-2 flex items-center gap-2">
                        <ThemeButton
                          label="Start Chat"
                          size={isMobile ? "small" : "medium"}
                          variant="filled"
                          className="w-fit"
                          heightClass={isMobile ? "h-8" : "h-9"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenState?.(false);
                            closeDialog?.();
                            setTimeout(() => {
                              router.push(`/chat`);
                            }, 0);
                          }}
                        />
                      </div>
                    )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!n.read && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary block"></span>
                )}

                <Tooltip content="Delete">
                  <button
                    onClick={() => handleDeleteClick(n.id)}
                    className="cursor-pointer bg-white rounded p-1 hover:bg-red-100"
                  >
                    <TrashBinIcon />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {isMobile ? (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="h-8 w-8 cursor-pointer md:w-11 md:h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center relative"
          >
            <ReminderIcon
              fill={user?.unreadNotifications ? "#10b981" : "white"}
            />
            {user?.unreadNotifications && (
              <span
                className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full 
              bg-green-500 border-2 border-white"
              ></span>
            )}
          </button>

          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            className="relative z-[99]"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
              <DialogPanel
                className="bg-white w-full relative h-full rounded-none pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3 bg-gray-100 flex sm:rounded-t-2xl items-center justify-between border-b border-gray-200">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-white flex items-center justify-center border border-lightGray">
                      <ReminderIcon
                        height="18"
                        width="18"
                        fill={user?.unreadNotifications ? "#10b981" : "#374151"}
                      />
                      {user?.unreadNotifications && (
                        <span
                          className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full 
              bg-green-500 border-2 border-white"
                        ></span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-black">
                      Notifications
                    </h2>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="md:p-1 p-1 hover:bg-gray-200 rounded-md cursor-pointer"
                  >
                    <CrossIcon />
                  </button>
                </div>
                <div className="overflow-y-auto h-[100dvh]  p-4 pb-16">
                  {renderList(undefined, () => setOpen(false), setOpen)}
                  <Link
                    href={
                      currentUserType === "doctor"
                        ? "/notifications"
                        : "/customer-notifications"
                    }
                    className="w-full mt-2 flex items-center justify-center text-center py-2 bg-blue-100 rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-200 text-primary"
                  >
                    View all
                  </Link>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        </>
      ) : (
        <Popover className="relative">
          {({ open: isPopoverOpen }) => (
            <>
              <PopoverButton
                onClick={() => {
                  // Fetch notifications only when opening the popover
                  if (!isPopoverOpen) {
                    fetchNotifications({
                      variables: {
                        page: 1,
                        perPage: 4,
                      },
                    });
                  }
                }}
                className="h-8 w-8 cursor-pointer md:w-11 md:h-11 rounded-full border-0 bg-black/40 backdrop-blur-sm flex items-center justify-center relative"
              >
                <ReminderIcon
                  fill={user?.unreadNotifications ? "#10b981" : "white"}
                />
                {user?.unreadNotifications && (
                  <span
                    className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full 
              bg-green-500 border-2 border-white"
                  ></span>
                )}
              </PopoverButton>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <PopoverPanel>
                  {({ close }) => (
                    <div className="absolute px-3 md:min-w-96 py-4 right-0 mt-2 w-96 rounded-xl shadow-lg bg-white">
                      {renderList(3, close, undefined)}

                      <Link
                        href={
                          currentUserType === "doctor"
                            ? "/notifications"
                            : "/customer-notifications"
                        }
                        onClick={() => close()}
                        className="w-full mt-2 flex items-center justify-center text-center py-2 bg-blue-100 rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-200 text-primary"
                      >
                        View all
                      </Link>
                    </div>
                  )}
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
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
        key={selectedRequest || "approve-modal"} // Force re-render when request changes
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
        key={selectedRequest || "reject-modal"} // Force re-render when request changes
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
    </>
  );
}
