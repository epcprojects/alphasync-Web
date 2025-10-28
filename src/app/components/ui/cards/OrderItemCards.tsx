import Image from "next/image";

export interface OrderItemProps {
  item: {
    id: string | number;
    medicineName: string;
    amount?: string;
    price: number;
    quantity?: number;
    status?: string;
    strength?: string;
    doctorName?: string;
    requestedOn?: string;
    userNotes?: string;
    physicianNotes?: string;
    denialReason?: string;
    description?: string;
  };
  requestStatus?: boolean;
  paymentRequest?: boolean;
  onClick?: () => void;
}

type Note = {
  label: string;
  value: string;
};

export function getStatusClasses(status: string) {
  switch (status) {
    case "Pending Review":
      return "bg-amber-50 border border-amber-200 text-amber-700";
    case "Approved":
      return "bg-green-50 border border-green-200 text-green-700";
    case "Denied":
      return "bg-red-50 border border-red-200 text-red-500";
    default:
      return "bg-gray-50 border border-gray-200 text-gray-700";
  }
}

const OrderItemCard: React.FC<OrderItemProps> = ({
  item,
  requestStatus,
  paymentRequest,
}) => {
  console.log(item);
  const details =
    requestStatus && !paymentRequest
      ? [
          { label: "Strength:", value: item.strength },
          { label: "Dosage Form:", value: "Injectable" },
          { label: "Doctor Name:", value: item.doctorName },
          { label: "Requested:", value: item.requestedOn },
          { label: "Category:", value: item.amount ?? "N/A" },
        ]
      : paymentRequest
      ? [
          { label: "Strength:", value: item.strength },
          { label: "Dosage Form:", value: "Injectable" },
          { label: "Doctor Name:", value: item.doctorName },
          { label: "Requested:", value: item.requestedOn },
          { label: "Category:", value: item.amount ?? "N/A" },
          { label: "Subtotal:", value: `$${item.price.toFixed(2)}` },
          { label: "Tax (8%):", value: `$${(item.price * 0.08).toFixed(2)}` },
        ]
      : [
          { label: "Quantity", value: item.quantity },
          { label: "Price", value: item.price.toFixed(2) || 120 },
        ];

  const notes: Note[] = [
    item.userNotes ? { label: "Your Notes:", value: item.userNotes } : null,
    item.physicianNotes
      ? { label: "Physician Notes:", value: item.physicianNotes }
      : null,
    item.denialReason
      ? { label: "Reason for Denial:", value: item.denialReason }
      : null,
  ].filter((note): note is Note => note !== null);

  return (
    <div
      key={item.id}
      className={`flex flex-col h-full ${
        requestStatus ? "gap-2 md:gap-6" : "gap-2"
      }`}
    >
      <div className="flex items-start gap-3 md:border-b md:border-gray-200 md:pb-4">
        <div className="w-18 h-18 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <Image
            alt="#"
            src={"/images/products/p1.png"}
            width={1024}
            height={1024}
          />
        </div>
        <div className="flex-1 flex flex-col gap-3 md:gap-1.5 ">
          <h3 className=" text-gray-800 font-semibold text-base">
            {item.medicineName}
          </h3>
          <div className={`${requestStatus ? "block" : "hidden"} md:flex`}>
            <p className="text-sm font-normal text-gray-800 line-clamp-2">
              {item.description || "No description available"}
            </p>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div
              className={`flex items-center ${item.status ? "gap-2" : "gap-0"}`}
            >
              {requestStatus && (
                <div>
                  {item.status && (
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs md:text-sm font-medium ${getStatusClasses(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  )}
                </div>
              )}
              {!requestStatus && (
                <div>
                  <span
                    className={`inline-block whitespace-nowrap border border-gray-200 rounded-full px-2.5 bg-gray-100 text-gray-700 py-0.5 text-xs md:text-sm font-medium`}
                  >
                    Recovery & Healing
                  </span>
                </div>
              )}
            </div>
            {item.amount && !requestStatus && (
              <p className="text-xs font-normal text-gray-800">{item.amount}</p>
            )}
          </div>
          {/* Desktop version - hidden on mobile, shown on desktop */}
          <div className="hidden md:flex md:flex-col md:gap-2 mt-2">
            {details.map((detail, index) => (
              <div
                key={index}
                className={`flex justify-between ${
                  detail.label === "Tax (8%):"
                    ? "border-b border-gray-200 pb-2"
                    : "border-none"
                }`}
              >
                <span className="text-sm font-normal text-gray-800">
                  {detail.label}
                </span>
                <span className={`text-sm font-medium text-gray-800 `}>
                  {detail.value}
                </span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-base font-medium text-gray-800">
                {requestStatus && !paymentRequest ? "Price" : "Total"}
              </span>
              {item.quantity && (
                <span className="text-base font-semibold text-primary">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              )}
              {requestStatus && paymentRequest && (
                <span className="text-base font-semibold text-primary">
                  ${item.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile version - full width, aligned from start */}
      <div
        className={`w-full px-2 ${
          requestStatus ? "border-b border-gray-200 pb-4" : ""
        } md:hidden`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-xs font-normal text-gray-800">
              {requestStatus ? "Strength:" : "Quantity"}
            </span>
            <span className="text-xs font-medium text-gray-800">
              {requestStatus ? item.strength : item.quantity}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs font-normal text-gray-800">
              {requestStatus ? "Dosage Form:" : "Price"}
            </span>
            <span className="text-xs font-medium text-gray-800">
              {requestStatus ? "Injectable" : `${item.price.toFixed(2)}`}
            </span>
          </div>
          {requestStatus && (
            <>
              {paymentRequest ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-xs font-normal text-gray-800">
                      Subtotal:
                    </span>
                    <span className="text-xs font-medium text-gray-800">
                      $125.99
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-xs font-normal text-gray-800">
                      Tax (8%):
                    </span>
                    <span className="text-xs font-medium text-gray-800">
                      $12.00
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-xs font-normal text-gray-800">
                      Doctor Name:
                    </span>
                    <span className="text-xs font-medium text-gray-800">
                      {item.doctorName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-normal text-gray-800">
                      Requested:
                    </span>
                    <span className="text-xs font-medium text-gray-800">
                      {item.requestedOn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-normal text-gray-800">
                      Category:
                    </span>
                    <span className="text-xs font-medium text-gray-800">
                      {item.amount ?? "N/A"}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
          <div className="flex justify-between">
            <span className="text-base font-medium text-gray-800">
              {requestStatus && !paymentRequest ? "Price" : "Total"}
            </span>
            {item.quantity && (
              <span className="text-base font-semibold text-primary">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            )}
            {requestStatus && !item.quantity && (
              <span className="text-base font-semibold text-primary">
                ${item.price}
              </span>
            )}
          </div>
        </div>
      </div>
      {notes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {notes.map((note, index) => (
            <div key={index}>
              <p className="text-base font-medium text-gray-900">
                {note.label}
              </p>
              <div
                className={`${
                  note.label === "Reason for Denial:"
                    ? "bg-red-100"
                    : "bg-porcelan"
                } p-3 rounded-lg mt-1`}
              >
                <p
                  className={`text-base font-normal ${
                    note.label === "Reason for Denial:"
                      ? "text-red-900"
                      : "text-gray-600"
                  }`}
                >
                  {note.value}
                </p>
              </div>
              {index !== notes.length - 1 && (
                <hr className="mb-2 mt-4 text-gray-200" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderItemCard;
