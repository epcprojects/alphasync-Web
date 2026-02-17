"use client";

import React from "react";
import AppModal, { ModalPosition } from "@/app/components/ui/modals/AppModal";
import ProductImage from "@/app/components/ui/ProductImage";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { getStatusClasses, formatStatusDisplay } from "@/app/components/ui/cards/OrderListView";
import OrderDetail from "../../../../public/icons/OrdeerDetail";

const formatPrice = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(numValue)) return String(value);
  return numValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
};

/** Order details passed from admin orders list (from ADMIN_ORDERS query). */
export interface AdminOrderDetail {
  id: string;
  displayId?: string | number;
  createdAt: string;
  processedAt?: string | null;
  status: string;
  myClinic?: boolean | null;
  subtotalPrice?: number | null;
  totalTax?: number | null;
  totalPrice: number;
  netCost: number | null;
  profit: number | null;
  shipmentStatus?: string | null;
  shipstationOrderId?: string | null;
  trackingNumber?: string | null;
  doctor?: {
    id: string;
    email?: string | null;
    fullName?: string | null;
    imageUrl?: string | null;
  } | null;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    totalPrice: number;
    product?: { id: string; title?: string | null; price?: number | null; primaryImage?: string | null } | null;
  }>;
  patient: {
    id: string;
    fullName?: string | null;
    email?: string | null;
    imageUrl?: string | null;
  } | null;
}

interface AdminOrderDetailCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrderDetail | null;
}

export default function AdminOrderDetailCanvas({
  isOpen,
  onClose,
  order,
}: AdminOrderDetailCanvasProps) {
  useBodyScrollLock(isOpen);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<OrderDetail />}
      title="Order Details"
      outSideClickClose={false}
      subtitle={order ? `#${order.displayId ?? order.id}` : ""}
      position={ModalPosition.RIGHT}
      showFooter={typeof window !== "undefined" && window.innerWidth < 640}
      cancelLabel="Close"
      size="large"
    >
      {order && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Status</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-sm font-medium capitalize ${getStatusClasses(
                order.status
              )}`}
            >
              {formatStatusDisplay(order.status)}
            </span>
            {order.myClinic && (
              <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 text-xs font-medium">
                Clinic order
              </span>
            )}
          </div>

          <div
            className={`grid grid-cols-1 gap-4 border border-gray-200 rounded-xl p-4 bg-gray-50/50 ${!order.myClinic ? "sm:grid-cols-2" : ""}`}
          >
            {!order.myClinic && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Customer
                </p>
                <p className="text-gray-900 font-medium mt-0.5">
                  {order.patient?.fullName ?? "—"}
                </p>
                {order.patient?.email && (
                  <p className="text-sm text-gray-600">{order.patient.email}</p>
                )}
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Doctor
              </p>
              <p className="text-gray-900 font-medium mt-0.5">
                {order.doctor?.fullName ?? "—"}
              </p>
              {order.doctor?.email && (
                <p className="text-sm text-gray-600">{order.doctor.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 border-b border-gray-200 pb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Order date</span>
              <span className="text-gray-900">{formatDate(order.createdAt)}</span>
            </div>
            {order.processedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processed</span>
                <span className="text-gray-900">{formatDate(order.processedAt)}</span>
              </div>
            )}
          </div>

          {(order.shipmentStatus ||
            order.shipstationOrderId ||
            order.trackingNumber) && (
            <div className="space-y-2 border-b border-gray-200 pb-4">
              <h3 className="text-sm font-semibold text-gray-800">Shipment</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    order.shipmentStatus?.toLowerCase().includes("delivered")
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : order.shipmentStatus?.toLowerCase().includes("shipped")
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-700"
                        : "bg-amber-50 border border-amber-200 text-amber-700"
                  }`}
                >
                  {order.shipmentStatus ?? "In Progress"}
                </span>
              </div>
              {order.shipstationOrderId && (
                <div className="flex justify-between text-sm gap-4">
                  <span className="text-gray-600 shrink-0">ShipStation Order ID</span>
                  <span className="text-gray-900 font-mono text-xs break-all text-right">
                    {order.shipstationOrderId}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm gap-4">
                <span className="text-gray-600 shrink-0">Tracking Number</span>
                <span className="text-gray-900 font-mono text-xs break-all text-right">
                  {order.trackingNumber ?? "In Progress"}
                </span>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Items</h3>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
              {order.orderItems.length === 0 ? (
                <p className="text-sm text-gray-500 p-4">No items</p>
              ) : (
                order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 md:p-4 bg-white hover:bg-gray-50/50"
                  >
                    <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <ProductImage
                        alt={item.product?.title ?? "Product"}
                        src={item.product?.primaryImage}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-900 font-medium">
                        {item.product?.title ?? "Product"}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Qty: {item.quantity} × ${formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900 shrink-0">
                      ${formatPrice(item.totalPrice)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            {order.subtotalPrice != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${formatPrice(order.subtotalPrice)}</span>
              </div>
            )}
            {order.totalTax != null && Number(order.totalTax) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">${formatPrice(order.totalTax)}</span>
              </div>
            )}
            {order.netCost != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Net cost</span>
                <span className="text-gray-900">${formatPrice(order.netCost)}</span>
              </div>
            )}
            {order.profit != null && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Profit</span>
                <span className="text-green-600 font-medium">${formatPrice(order.profit)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium pt-1 border-t border-gray-100">
              <span className="text-gray-800">Total</span>
              <span className="text-gray-900">${formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      )}
    </AppModal>
  );
}
