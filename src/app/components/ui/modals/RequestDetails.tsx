import React, { useState } from "react";
import AppModal, { ModalPosition } from "./AppModal";
import { BubbleChatIcon, ShopingCartIcon } from "@/icons";
import OrderItemCard from "../cards/OrderItemCards";
import Card from "../../../../../public/icons/Card";
import { NoteAttributes } from "@/lib/graphql/attributes";
import ChatWithPhysician from "./CharWithPyhsicianModel";
import CustomerOrderPayment from "./CustomerOrderPayment";

interface requestDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  request: requestDetails | null;
  onClick: () => void;
  oncancel?: () => void;
  onPaymentSuccess?: () => void | Promise<void>;
}

export type requestDetails = {
  id: number | string;
  title: string;
  subtitle?: string;
  description?: string;
  status: string;
  requestedDate?: string;
  reviewedDate?: string;
  doctorName?: string;
  doctorId?: string;
  price?: string;
  userNotes?: NoteAttributes[];
  physicianNotes?: string;
  customerReason?: string;
  category?: string;
  displayId?: string;
  orderPaid?: boolean;
  originalId?: string | number | null;
  orderId?: string | number | null;
  orderStatus?: string | null;
};

const RequestDetails: React.FC<requestDetailsProps> = ({
  isOpen,
  onClose,
  request,
  onClick,
  oncancel,
  onPaymentSuccess,
}) => {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  if (!request) return null;

  const transformedItem =
    request && request.price
      ? {
          id: request.id,
          medicineName: request.title,
          amount: request.category ?? "N/A",
          price: parseFloat(request.price.replace(/[^0-9.-]+/g, "")),
          quantity: 1,
          status: request.status,
          strength: request.subtitle,
          doctorName: request.doctorName,
          requestedOn: request.requestedDate,
          userNotes: request.userNotes
            ?.map((note) => note?.content)
            .filter((content): content is string => Boolean(content)),
          physicianNotes: request.physicianNotes,
          customerReason: request?.customerReason,
          description: request.description,
        }
      : null;

  return (
    <>
      <AppModal
        isOpen={isOpen}
        onClose={onClose}
        icon={<ShopingCartIcon fill="#374151" />}
        title="Request details"
        subtitle={
          request?.displayId
            ? `Request ID ${request.displayId}`
            : request?.id
            ? `Request ID #REQ-${request.id}`
            : "Request ID #REQ-001"
        }
        position={ModalPosition.RIGHT}
        showFooter={true}
        hideConfirmButton={
          request.status === "Approved" &&
          !request.orderPaid &&
          request.orderStatus === "pending_payment"
            ? false
            : true
        }
        hideCancelBtn={
          request.status === "Approved" || request.status === "Denied"
            ? true
            : false
        }
        cancelLabel="Follow up with Physician"
        onConfirm={() => {
          if (transformedItem) {
            setIsPaymentModalOpen(true);
          } else {
            onClick();
          }
        }}
        onCancel={() => {
          if (request.doctorId) {
            setIsChatModalOpen(true);
          } else if (oncancel) {
            oncancel();
          }
        }}
        outSideClickClose={false}
        btnIcon={<Card fill="#fff" />}
        confirmLabel="Proceed to Payment"
        btnFullWidth={true}
        cancelBtnIcon={<BubbleChatIcon fill="#000" />}
      >
        {transformedItem && (
          <OrderItemCard
            key={transformedItem.id}
            item={transformedItem}
            requestStatus={true}
          />
        )}
      </AppModal>
      {request.doctorId && (
        <ChatWithPhysician
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          participantId={request.doctorId}
          participantName={request.doctorName || "Physician"}
          itemTitle={request.displayId || `REQ-${request.id}`}
        />
      )}
      {transformedItem && (
        <CustomerOrderPayment
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          order={{
            id: request?.orderId || request?.originalId || transformedItem.id,
            displayId:
              request?.displayId ||
              `REQ-${request?.originalId || transformedItem.id}`,
            doctorName: transformedItem.doctorName || "Unknown Doctor",
            orderedOn:
              transformedItem.requestedOn ||
              new Date().toLocaleDateString("en-US"),
            totalPrice: transformedItem.price,
            orderItems: [
              {
                id:
                  request?.orderId || request?.originalId || transformedItem.id,
                medicineName: transformedItem.medicineName,
                quantity: 1,
                price: transformedItem.price,
                amount:
                  transformedItem.amount ||
                  `$${transformedItem.price.toFixed(2)}`,
              },
            ],
          }}
          onClick={async () => {
            // Handle payment token - close payment modal and call original onClick
            setIsPaymentModalOpen(false);
            // The token is passed from CustomerOrderPayment after successful payment processing
            if (onPaymentSuccess) {
              await onPaymentSuccess();
            }
            onClick();
          }}
        />
      )}
    </>
  );
};

export default RequestDetails;
