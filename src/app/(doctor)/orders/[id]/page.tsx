"use client";
import { ThemeButton } from "@/app/components";
import CustomerInfoCard from "@/app/components/ui/cards/CustomerInfoCard";
import {
  ArrowDownIcon,
  CrossIcon,
  DeliveryTruckIcon,
  LocationIcon,
  MessageOutgoingIcon,
  PrinterIcon,
  ShipmentTrackingIcon,
} from "@/icons";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { FETCH_ORDER, PAYMENT_INVOICES } from "@/lib/graphql/queries";
import { CANCEL_ORDER } from "@/lib/graphql/mutations";
import { UserAttributes } from "@/lib/graphql/attributes";
import {
  getStatusClasses,
  formatStatusDisplay,
} from "@/app/components/ui/cards/OrderListView";
import AppModal from "@/app/components/ui/modals/AppModal";
import { showErrorToast } from "@/lib/toast";
import ChatWithPhysician from "@/app/components/ui/modals/CharWithPyhsicianModel";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  totalPrice: number;
  product: {
    id: string;
    title: string;
    variants: {
      id: string;
      price: number;
      shopifyVariantId: string;
    }[];
  };
}

interface FetchOrderResponse {
  fetchOrder: {
    id: string;
    displayId?: string | number;
    createdAt: string;
    status: string;
    subtotalPrice: number;
    totalPrice: number;
    totalTax: number;
    patient: UserAttributes;
    orderItems: OrderItem[];
  };
}

interface PaymentInvoice {
  amount: number;
  orderId: string;
  billingAddress: string;
  status: string;
  transactionId: string;
  invoiceNumber: string;
}

interface PaymentInvoicesResponse {
  paymentInvoices: PaymentInvoice[];
}

const Page = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  // GraphQL query to fetch order details
  const { data, loading, error, refetch } = useQuery<FetchOrderResponse>(
    FETCH_ORDER,
    {
      variables: {
        id: params.id,
      },
      fetchPolicy: "network-only",
    }
  );

  const [cancelOrder, { loading: cancellingOrder }] = useMutation(CANCEL_ORDER);
  const [fetchPaymentInvoices, { loading: invoiceLoading }] =
    useLazyQuery<PaymentInvoicesResponse>(PAYMENT_INVOICES);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = React.useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = React.useState(false);

  const order = data?.fetchOrder;

  // Loading state
  if (loading) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading order details...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error.message}</div>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Order not found</div>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOrderCancelled =
    order?.status?.toLowerCase() === "cancelled" ||
    order?.status?.toLowerCase() === "canceled" ||
    order?.status?.toLowerCase() === "paid";

  const handleDownloadInvoice = async () => {
    if (!order?.id) return;

    setIsGeneratingInvoice(true);
    try {
      const { data: invoiceResponse } = await fetchPaymentInvoices({
        variables: { orderId: order.id },
        fetchPolicy: "network-only",
      });

      const invoice = invoiceResponse?.paymentInvoices?.[0];

      if (!invoice) {
        showErrorToast("No invoice data available for this order.");
        return;
      }

      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      const currency = (value: number) => `$${value.toFixed(2)}`;
      const primaryColor: [number, number, number] = [26, 64, 122];
      const accentColor: [number, number, number] = [60, 133, 245];
      const mutedColor: [number, number, number] = [99, 102, 241];
      const textColor: [number, number, number] = [33, 33, 33];

      const addSectionTitle = (label: string, startY: number) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(label, margin, startY);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, startY + 2, pageWidth - margin, startY + 2);
        return startY + 10;
      };

      // Hero header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.triangle(0, 40, 60, 0, 120, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("AlphaSync Pharmacy", margin, 18);
      doc.setFontSize(12);
      doc.text("Official Invoice", pageWidth - margin, 18, { align: "right" });

      doc.setFontSize(10);
      doc.text(
        "Trusted care & pharmacy services for your patients.",
        margin,
        28
      );

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      let currentY = 52;

      // Quick info cards
      const infoBoxWidth = (contentWidth - 10) / 2;
      const drawInfoCard = (
        title: string,
        rows: { label: string; value: string }[],
        x: number,
        y: number
      ) => {
        let dynamicHeight = 20;
        rows.forEach((row) => {
          const lineCount = doc.splitTextToSize(
            row.value || "N/A",
            infoBoxWidth - 50
          ).length;
          dynamicHeight += Math.max(lineCount, 1) * 6;
        });
        const boxHeight = dynamicHeight;
        doc.setFillColor(248, 250, 255);
        doc.roundedRect(x, y, infoBoxWidth, boxHeight, 4, 4, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(title, x + 6, y + 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        let rowY = y + 18;
        rows.forEach((row) => {
          doc.setFont("helvetica", "bold");
          doc.text(`${row.label}:`, x + 6, rowY);
          doc.setFont("helvetica", "normal");
          const valueLines = doc.splitTextToSize(
            row.value || "N/A",
            infoBoxWidth - 50
          );
          doc.text(valueLines, x + 40, rowY);
          rowY += Math.max(valueLines.length, 1) * 6;
        });
        return y + boxHeight;
      };

      const invoiceBoxRows = [
        { label: "Invoice", value: invoice.invoiceNumber || "Pending" },
        { label: "Order", value: String(order.displayId || order.id) },
        { label: "Transaction", value: invoice.transactionId || "Pending" },
        { label: "Status", value: invoice.status || order.status },
        { label: "Date", value: formatDate(order.createdAt) },
      ];

      const patientBoxRows = [
        { label: "Patient", value: order.patient.fullName || "Unknown" },
        { label: "Email", value: order.patient.email || "N/A" },
        { label: "Phone", value: order.patient.phoneNo || "N/A" },
      ];

      const leftBoxEndY = drawInfoCard(
        "Invoice Summary",
        invoiceBoxRows,
        margin,
        currentY
      );
      const rightBoxEndY = drawInfoCard(
        "Patient Information",
        patientBoxRows,
        margin + infoBoxWidth + 10,
        currentY
      );

      currentY = Math.max(leftBoxEndY, rightBoxEndY) + 8;

      currentY = addSectionTitle("Order Items", currentY);

      // Table header
      doc.setFillColor(248, 250, 255);
      doc.roundedRect(margin, currentY - 6, contentWidth, 12, 3, 3, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Product", margin + 4, currentY);
      doc.text("Qty", margin + contentWidth * 0.58, currentY);
      doc.text("Unit Price", margin + contentWidth * 0.72, currentY);
      doc.text("Total", margin + contentWidth * 0.9, currentY, {
        align: "right",
      });
      doc.setFont("helvetica", "normal");

      currentY += 4;

      order.orderItems.forEach((item) => {
        const productLines = doc.splitTextToSize(
          item.product.title,
          contentWidth * 0.5
        );
        const lineHeight = productLines.length * 6 + 4;
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, currentY - 4, contentWidth, lineHeight, "F");
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(productLines, margin + 4, currentY);
        doc.text(String(item.quantity), margin + contentWidth * 0.58, currentY);
        doc.text(currency(item.price), margin + contentWidth * 0.72, currentY);
        doc.text(
          currency(item.totalPrice),
          margin + contentWidth * 0.9,
          currentY,
          {
            align: "right",
          }
        );
        currentY += lineHeight;
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, currentY - 6, pageWidth - margin, currentY - 6);
      });

      currentY += 12;

      // Totals summary
      const summaryBoxY = currentY;
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, summaryBoxY, contentWidth, 36, 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Payment Summary", margin + 6, summaryBoxY + 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Subtotal: ${currency(order.subtotalPrice)}`,
        margin + 6,
        summaryBoxY + 20
      );
      doc.text(
        `Tax: ${currency(order.totalTax)}`,
        margin + 6,
        summaryBoxY + 28
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
      doc.text(
        `Grand Total: ${currency(order.totalPrice)}`,
        pageWidth - margin,
        summaryBoxY + 20,
        { align: "right" }
      );
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      currentY = summaryBoxY + 50;

      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(
        "Thank you for trusting AlphaSync with your healthcare needs.",
        margin,
        currentY
      );
      currentY += 6;
      doc.text(
        "Questions about this invoice? Reach us at support@alphasync.com",
        margin,
        currentY
      );

      doc.save(`invoice-${invoice.invoiceNumber || order.id}.pdf`);
    } catch (invoiceError) {
      console.error("Failed to generate invoice PDF", invoiceError);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order?.id) return;
    try {
      await cancelOrder({
        variables: {
          orderId: order.id,
        },
      });
      await refetch();
      setIsCancelModalOpen(false);
    } catch (mutationError) {
      console.error("Failed to cancel order", mutationError);
    }
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
          Order {order.displayId || order.id}
        </h2>
      </div>

      <div className="w-full bg-white rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)]">
        <div>
          <CustomerInfoCard
            name={order.patient.fullName || "Unknown"}
            email={order.patient.email || ""}
            phone={order.patient.phoneNo || ""}
            totalOrders={order.patient.patientOrdersCount || 0}
            lastOrder={formatDate(order.createdAt)}
            address={order.patient.address || ""}
            onBack={() => console.log("Go back")}
            onViewProfile={() => router.push(`/customers/${order.patient.id}`)}
            getInitials={(name) =>
              name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
            }
          />

          <div className="p-3 md:p-6 flex flex-col gap-1.5 md:gap-3">
            <div className="flex items-center gap-1 flex-wrap justify-between">
              <div className="flex items-center gap-1 md:gap-4">
                <h2 className="text-sm whitespace-nowrap md:text-lg font-semibold text-black">
                  Order {order.displayId || order.id}
                </h2>
                <span className="text-gray-700 font-medium text-xxs md:text-sm py-0.5 px-2.5 rounded-full bg-gray-100 border border-gray-200">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <span
                className={`inline-block rounded-full whitespace-nowrap px-2.5 py-0.5 text-xxs md:text-sm font-medium capitalize ${getStatusClasses(
                  order.status
                )}`}
              >
                {formatStatusDisplay(order.status)}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="hidden sm:grid grid-cols-4 gap-2 text-sm font-medium text-black rounded-xl bg-gray-50 p-1.5 md:p-3">
                <div>Product</div>
                <div>Quantity</div>
                <div>Unit Price</div>
                <div>Total</div>
              </div>

              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-4 items-start rounded-lg sm:rounded-xl bg-gray-50 p-1.5 md:py-2 md:px-3"
                >
                  <div className="text-gray-800 text-sm md:text-base sm:order-1 order-1">
                    <span className="text-black font-medium text-sm sm:hidden inline-block pe-2">
                      Product:
                    </span>
                    {item.product.title}
                  </div>
                  <div className="flex sm:order-2 order-3">
                    <span className="text-black font-medium text-sm sm:hidden inline-block pe-2">
                      Quantity:
                    </span>
                    <span className="inline-block rounded-full sm:px-2 sm:py-0.5 text-sm sm:font-medium text-gray-800 sm:text-gray-700 sm:bg-gray-50 sm:border sm:border-gray-200">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="text-gray-800 flex sm:justify-start justify-end text-sm md:text-base font-normal sm:order-3 order-2">
                    <span className="text-black font-medium text-sm sm:hidden inline-block pe-2">
                      Unit Price:
                    </span>
                    ${item.price.toFixed(2)}
                  </div>
                  <div className="text-gray-800 text-sm flex sm:justify-start justify-end md:text-base sm:font-medium sm:order-4 order-4">
                    <span className="text-black font-medium text-sm sm:hidden inline-block pe-2">
                      Total:
                    </span>
                    ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-4 bg-sky-50 p-1.5 md:py-2 md:px-3 rounded-lg md:rounded-xl">
                <div className="col-span-3 text-gray-800 font-semibold text-base md:text-lg">
                  Order Total
                </div>
                <div className="text-base md:text-lg font-semibold text-primary">
                  ${order.totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-6 !pt-0 flex flex-col gap-1.5 md:gap-3">
          <h2 className="font-semibold text-base md:text-lg text-black ">
            Shipping Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-4">
            <div className="rounded-lg flex items-center gap-1 md:gap-2 p-2 bg-gray-50 ">
              <div className="rounded-lg bg-white border border-gray-200 flex items-center justify-center w-10 h-10">
                <DeliveryTruckIcon />
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="font-medium text-sm text-gray-500 ">
                  Tracking Number:
                </h2>
                <h3 className="text-xs md:text-base text-gray-800">
                  TRK123456789
                </h3>
              </div>
            </div>
            <div className="rounded-lg flex items-start sm:items-center gap-1 md:gap-2 p-2 bg-gray-50 ">
              <div className="rounded-lg shrink-0 bg-white border border-gray-200 flex items-center justify-center w-10 h-10">
                <LocationIcon />
              </div>
              <div className="flex flex-col gap-0.5">
                <h2 className="font-medium text-sm text-gray-500 ">
                  Shipping Address:
                </h2>
                <h3 className="text-sm md:text-base text-gray-800">
                  {order.patient.address || "No address provided"}
                </h3>
              </div>
            </div>
          </div>
          <div className="flex items-center flex-col md:flex-row flex-wrap justify-end gap-1.5 md:gap-3">
            {!isOrderCancelled && (
              <ThemeButton
                label="Cancel Order"
                variant="outline"
                size="medium"
                icon={<CrossIcon fill="#EF4444" height="18" width="18" />}
                onClick={() => setIsCancelModalOpen(true)}
                disabled={cancellingOrder}
                className="w-full sm:w-fit"
                heightClass="md:h-11 h-10"
              />
            )}

            {order.status?.toLowerCase() === "paid" && (
              <ThemeButton
                label="Track Package"
                variant="outline"
                size="medium"
                icon={<ShipmentTrackingIcon />}
                onClick={() => {}}
                className="w-full sm:w-fit"
                heightClass="md:h-11 h-10"
              />
            )}

            {order.status?.toLowerCase() === "paid" && (
              <ThemeButton
                label="Print Invoice"
                variant="outline"
                size="medium"
                icon={<PrinterIcon />}
                onClick={handleDownloadInvoice}
                disabled={invoiceLoading || isGeneratingInvoice}
                className="w-full sm:w-fit"
                heightClass="md:h-11 h-10"
              />
            )}

            <ThemeButton
              label="Send Update to Customer"
              variant="outline"
              size="medium"
              icon={<MessageOutgoingIcon />}
              onClick={() => setIsChatModalOpen(true)}
              className="w-full sm:w-fit"
              heightClass="md:h-11 h-10"
            />
          </div>
        </div>
      </div>
      {!isOrderCancelled && (
        <AppModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Cancel Order"
          subtitle=""
          onConfirm={handleCancelOrder}
          confirmLabel={cancellingOrder ? "Cancelling..." : "Confirm Cancel"}
          confirmBtnVarient="danger"
          cancelLabel="Keep Order"
          confimBtnDisable={cancellingOrder}
          bodyPaddingClasses="p-4 md:p-6"
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm md:text-base text-gray-700">
              Are you sure you want to cancel order{" "}
              {order.displayId || order.id}?
            </p>
          </div>
        </AppModal>
      )}
      {order?.patient?.id && (
        <ChatWithPhysician
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          participantId={String(order.patient.id)}
          participantName={order.patient.fullName || "Customer"}
          itemTitle={order.displayId ? String(order.displayId) : order.id}
        />
      )}
    </div>
  );
};

export default Page;
