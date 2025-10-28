import AppModal, { ModalPosition } from "./AppModal";
import { useEffect, useState } from "react";
import Image from "next/image";
import Card from "../../../../../public/icons/Card";
import ThemeInput from "../inputs/ThemeInput";
import { CardData } from "../../../../../public/data/CreditCard";
import {
  Amex,
  CreditCard,
  Dinners,
  Discover,
  JCB,
  Lock,
  Maestro,
  Master,
  RuPay,
  UnionPay,
  Visa,
} from "@/icons";
import OrderItemCard, { OrderItemProps } from "../cards/OrderItemCards";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type OrderItem = {
  id: string | number;
  medicineName: string;
  amount: string;
  quantity: number;
  price: number;
};

type order = {
  orderNumber: string;
  doctorName: string;
  orderedOn: string;
  shippingAddress?: string;
  isDueToday?: string;
  totalPrice: string | number;
  orderItems: OrderItem[];
};

export type requestProps = {
  id: string | number;
  medicineName: string;
  doctorName: string;
  strength: string;
  price: number;
  status?: string;
  requestedOn?: string;
  category?: string;
};

interface CustomerOrderPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  order?: order;
  onClick: () => void;
  request?: requestProps;
}

const cardImages: Record<CardType, React.FC> = {
  Visa: Visa,
  Mastercard: Master,
  American: Amex,
  Discover: Discover,
  JCB: JCB,
  Diners: Dinners,
  RuPay: RuPay,
  Maestro: Maestro,
  UnionPay: UnionPay,
  Default: CreditCard,
};

type CardType =
  | "Default"
  | "Visa"
  | "Mastercard"
  | "American"
  | "Discover"
  | "JCB"
  | "Diners"
  | "RuPay"
  | "Maestro"
  | "UnionPay";

const CustomerOrderPayment: React.FC<CustomerOrderPaymentProps> = ({
  onClose,
  order,
  onClick,
  request,
  isOpen,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardType, setCardType] = useState("Default");
  const [zipCode, setZipCode] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [maxCardLength, setMaxCardLength] = useState(19);
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expiryError, setExpiryError] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");

  useBodyScrollLock(isOpen);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768); // md breakpoint
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (request) {
      setShowForm(true);
    }
  }, [request]);

  const handleContinue = () => {
    setShowForm(true);
  };

  if (!order && !request) return null;

  const subTotal =
    order?.orderItems?.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    ) ?? 0;

  const tax = (subTotal * 0.08).toFixed(2);
  const total = (subTotal + parseFloat(tax)).toFixed(2);

  const detectCardType = (number: string): void => {
    if (!number) {
      setCardType("Default");
      setMaxCardLength(19);
      return;
    }

    const matchedCard = CardData.cards.find((card) =>
      card.start_digits.some((prefix) => {
        if (prefix.includes("-")) {
          const [min, max] = prefix.split("-").map(Number);
          const firstDigits = Number(number.slice(0, min.toString().length));
          return firstDigits >= min && firstDigits <= max;
        }
        return number.startsWith(prefix);
      })
    );

    if (matchedCard) {
      const maxDigits = Math.max(...matchedCard.length);
      const formatPattern = getCardFormat(
        matchedCard.name as CardType,
        maxDigits
      );
      const spaces = formatPattern.length - 1;

      setMaxCardLength(maxDigits + spaces);
      setCardType(matchedCard.name);
    } else {
      setCardType("Default");
      setMaxCardLength(19);
    }
  };

  const formatCardNumber = (text: string) => {
    const isBackspacing =
      cardNumber.length > text.length && cardNumber.endsWith(" ");
    // eslint-disable-next-line prefer-const
    let cleaned = text
      .replace(/[^\d\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    let digitsOnly = cleaned.replace(/\s/g, "");
    if (isBackspacing) {
      digitsOnly = digitsOnly.slice(0, -1);
    }
    const matchedCard = CardData.cards.find((card) =>
      card.start_digits.some((prefix) => {
        if (prefix.includes("-")) {
          const [min, max] = prefix.split("-").map(Number);
          const firstDigits = Number(
            digitsOnly.slice(0, min.toString().length)
          );
          return firstDigits >= min && firstDigits <= max;
        }
        return digitsOnly.startsWith(prefix);
      })
    );
    const formatPattern = matchedCard
      ? getCardFormat(matchedCard.name as CardType, digitsOnly.length)
      : getCardFormat("Default", digitsOnly.length);

    let formatted = "";
    let digitsUsed = 0;

    for (
      let i = 0;
      i < formatPattern.length && digitsUsed < digitsOnly.length;
      i++
    ) {
      const groupSize = formatPattern[i];
      const groupDigits = Math.min(groupSize, digitsOnly.length - digitsUsed);
      formatted += digitsOnly.slice(digitsUsed, digitsUsed + groupDigits);
      digitsUsed += groupDigits;

      if (groupDigits === groupSize && i < formatPattern.length - 1) {
        formatted += " ";
      }
    }

    setCardNumber(formatted);
    detectCardType(digitsOnly);
  };

  const getCardFormat = (
    cardName: keyof typeof cardImages,
    cardLength: number
  ): number[] => {
    const formats: Record<keyof typeof cardImages, number[]> = {
      Visa: [4, 4, 4, 4],
      Mastercard: [4, 4, 4, 4],
      American: [4, 6, 5],
      Discover: [4, 4, 4, 4],
      JCB: [4, 4, 4, 4],
      Diners: [4, 6, 4],
      RuPay: [4, 4, 4, 4],
      Maestro: [4, 4, 4, 4, 3],
      UnionPay: [4, 4, 4, 4],
      Default: [4, 4, 4, 4],
    };

    if (cardName === "Maestro") {
      switch (cardLength) {
        case 12:
          return [4, 4, 4];
        case 13:
          return [4, 4, 5];
        case 14:
          return [4, 6, 4];
        case 15:
          return [4, 6, 5];
        case 16:
          return [4, 4, 4, 4];
        case 17:
          return [4, 4, 4, 5];
        case 18:
          return [4, 4, 4, 6];
        case 19:
          return [4, 4, 4, 4, 3];
        default:
          return [4, 4, 4, 4];
      }
    }

    return formats[cardName] || [4, 4, 4, 4];
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const prev = expiryDate;
    const isBackSpace = raw.length < prev.length;
    let inputText = raw;
    if (!isBackSpace) {
      const added = raw.slice(prev.length);
      const addedDigits = added.replace(/[^0-9]/g, "");
      if (addedDigits.length === 0) return;
      inputText = (prev + addedDigits).slice(0, 5);
    } else {
      inputText = raw.replace(/[^0-9/]/g, "");
    }
    let enteredText = inputText;
    let newKey = "";
    if (!isBackSpace) {
      newKey = inputText.slice(prev.length);
    }
    if (newKey.length > 0) {
      const newChar = newKey.charAt(0);
      if (prev.length === 0) {
        if (newChar === "0" || newChar === "1") {
          enteredText = newChar;
        } else {
          enteredText = "0" + newChar + "/";
        }
      } else if (prev.length === 1) {
        const month = parseInt(prev + newChar, 10);
        if (!isNaN(month) && month <= 12) {
          enteredText = prev + newChar + "/";
        } else {
          enteredText = "0" + prev + "/" + newChar;
        }
      } else {
        enteredText = inputText;
        const [month] = enteredText.split("/");
        if (month && month.length > 2) {
          enteredText = prev;
        }
      }
    } else {
      if (prev.length === 3) {
        enteredText = prev.slice(0, 2);
      } else if (prev.length === 4 || prev.length === 5) {
        if (enteredText.includes("/")) {
          const rawText = enteredText.replace("/", "");
          const first = rawText.charAt(0) || "";
          const second = rawText.charAt(1) || "";
          const third = rawText.charAt(2) || "";
          const monthString = first + second;
          const month = parseInt(monthString || "0", 10);
          if (!isNaN(month) && month <= 12) {
            if (prev.length === 4) {
              enteredText = rawText + "/";
            } else {
              enteredText = monthString + "/";
              if (third) enteredText += third;
            }
          } else {
            enteredText = "0" + first + "/" + second;
            if (third) enteredText += third;
          }
        } else {
          enteredText = prev;
        }
      }
    }
    setExpiryDate(enteredText);
  };

  const validateExpiry = (date: string) => {
    if (!date || date.length !== 5 || !date.includes("/")) {
      setExpiryError("Please enter a valid expiry date (MM/YY)");
      return;
    }

    const [month, year] = date.split("/");
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (
      isNaN(Number(month)) ||
      isNaN(Number(year)) ||
      Number(month) < 1 ||
      Number(month) > 12
    ) {
      setExpiryError("Invalid month");
      return;
    }

    if (
      Number(year) < currentYear ||
      (Number(year) === currentYear && Number(month) < currentMonth)
    ) {
      setExpiryError("Expiry date cannot be in the past");
      return;
    }
    setExpiryError("");
  };

  const validateCardNumber = (number: string, detectedType: CardType) => {
    if (!number) {
      setCardNumberError("Card number is required");
      return;
    }

    const cleanCardNumber = number.replace(/\s/g, "");
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      setCardNumberError("Card number must be between 13 and 19 digits");
      return;
    }

    if (detectedType === "Default") {
      setCardNumberError("Please enter a valid card number");
      return;
    }

    setCardNumberError("");
  };

  const isAnyFieldValid = () => {
    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19)
      return false;

    if (!expiryDate || expiryDate.length !== 5 || !expiryDate.includes("/"))
      return false;

    const [month, year] = expiryDate.split("/");
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (
      isNaN(Number(month)) ||
      isNaN(Number(year)) ||
      Number(month) < 1 ||
      Number(month) > 12 ||
      Number(year) < currentYear ||
      (Number(year) === currentYear && Number(month) < currentMonth)
    )
      return false;

    const isCvvValid =
      cardType === "American"
        ? cvv.length === 4
        : cvv.length === 3 || cvv.length === 4;
    if (!cvv || !isCvvValid || !/^\d+$/.test(cvv)) return false;

    if (!cardHolderName || cardHolderName.trim() === "") return false;

    if (!billingAddress || billingAddress.trim() === "") return false;

    if (!zipCode || !/^[A-Za-z0-9\s]{1,10}$/.test(zipCode)) return false;

    return true;
  };

  const SelectedCardIcon: React.FC =
    cardImages[cardType as keyof typeof cardImages] || cardImages.Default;

  let transformedItem: OrderItemProps["item"] | undefined;

  if (request) {
    transformedItem = {
      id: request.id,
      medicineName: request.medicineName,
      price: request.price,
      doctorName: request.doctorName,
      strength: request.strength,
      status: request.status,
      amount: request.category,
      requestedOn: request.requestedOn,
    };
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<Card />}
      outSideClickClose={false}
      title={isMobile && !showForm ? "Order Summary" : "Complete Payment"}
      subtitle={
        isMobile ? "" : "Your payment information is secure and encrypted"
      }
      position={ModalPosition.RIGHT}
      showFooter={true}
      onConfirm={(e) => {
        e.preventDefault();
        if (!showForm && window.innerWidth < 768) {
          handleContinue();
        } else {
          onClick();
        }
      }}
      onCancel={() => {
        if (isMobile && showForm) {
          setShowForm(false);
          onClose();
        } else {
          onClose();
        }
      }}
      confimBtnDisable={
        (showForm || !isMobile) &&
        (!isAnyFieldValid() || cardType === "Default")
      }
      confirmLabel={
        isMobile && !request
          ? showForm
            ? `Pay $${total}`
            : "Continue"
          : request || isMobile
          ? "Pay Now"
          : `Pay $${total}`
      }
      btnFullWidth={true}
    >
      {(order || request) && (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
          {order ? (
            <div className={`${showForm ? "hidden" : "block"} md:block`}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-950">
                  Order #{order.orderNumber}
                </h2>
                <span className="text-primary text-sm font-semibold">
                  {order.orderItems.length.toString().padStart(2, "0")} Items
                </span>
              </div>
              <div className="flex flex-col gap-4 mt-4 border-b border-gray-200 pb-3 md:pb-4 ">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-gray-100 rounded-md p-1.5 gap-2"
                  >
                    <div className="flex gap-2 items-center">
                      <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg flex items-center justify-center">
                        <Image
                          alt="#"
                          src={"/images/products/p1.png"}
                          width={1024}
                          height={1024}
                        />
                      </div>
                      <span className="text-sm font-normal text-gray-800">
                        {item.medicineName}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm font-medium text-raven bg-white px-2.5 rounded-sm">
                        x{item.quantity}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 border-b border-gray-200 py-3 md:py-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-gray-800">
                    Sub total
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    ${subTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-gray-800">
                    Tax (8%)
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    ${tax}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 md:py-4">
                <span className="text-base font-medium text-gray-800">
                  Total
                </span>
                <span className="text-base font-semibold text-primary">
                  ${total}
                </span>
              </div>
            </div>
          ) : (
            transformedItem && (
              <OrderItemCard
                item={transformedItem}
                requestStatus
                paymentRequest={true}
              />
            )
          )}
          <form
            className={`${!showForm && isMobile ? "hidden" : "block"}
            flex flex-col gap-4`}
          >
            <div className="flex items-center gap-3 py-2 px-4 bg-blue-50 md:hidden rounded-xl">
              <Lock />
              <span className="text-sm font-medium text-blue-900">
                Your payment information is secure and encrypted
              </span>
            </div>
            <ThemeInput
              id="Name"
              label="Name on card"
              name="Name"
              type="text"
              placeholder="Enter Name"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
            />
            <ThemeInput
              id="Card number"
              label="Card number"
              name="Card number"
              type="Card number"
              placeholder="1234 1234 1234 1234"
              value={cardNumber}
              onChange={(e) => formatCardNumber(e.target.value)}
              onBlur={() =>
                validateCardNumber(cardNumber, cardType as CardType)
              }
              icon={<SelectedCardIcon />}
              maxLength={maxCardLength}
              error={!!cardNumberError}
              errorMessage={cardNumberError}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <ThemeInput
                  id="Expiry"
                  label="Expiry"
                  name="Expiry"
                  type="text"
                  placeholder="MM / YY"
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  onBlur={() => validateExpiry(expiryDate)}
                  maxLength={5}
                  error={!!expiryError}
                  errorMessage={expiryError}
                />
              </div>
              <div className="flex-1">
                <ThemeInput
                  id="CVV"
                  label="CVV"
                  name="CVV"
                  type="text"
                  placeholder="..."
                  value={cvv}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    setCvv(e.target.value);
                  }}
                  maxLength={4}
                />
              </div>
            </div>
            <ThemeInput
              id="ZIP Code"
              label="ZIP Code"
              name="ZIP Code"
              type="text"
              placeholder="12345"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={10}
            />
            <ThemeInput
              id="Billing Address"
              label="Billing Address"
              name="Billing Address"
              type="text"
              placeholder="Enter Billing address"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
            />
          </form>
        </div>
      )}
    </AppModal>
  );
};

export default CustomerOrderPayment;
