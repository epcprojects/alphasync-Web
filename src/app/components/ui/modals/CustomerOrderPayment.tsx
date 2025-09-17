import AppModal, { ModalPosition } from "./AppModal";
import { useEffect, useState } from "react";
import Image from "next/image";
import Card from "../../../../../public/icons/Card";
import ThemeInput from "../inputs/ThemeInput";
import ThemeButton from "../buttons/ThemeButton";
import { CardData } from "../../../../../public/data/CreditCard";
import {
  Amex,
  Dinners,
  Discover,
  JCB,
  Maestro,
  Master,
  RuPay,
  UnionPay,
  Visa,
} from "@/icons";

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

interface CustomerOrderPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  order: order | null;
  onClick: () => void;
}

const cardImages = {
  Visa: Visa,
  Mastercard: Master,
  American: Amex,
  Discover: Discover,
  JCB: JCB,
  Diners: Dinners,
  RuPay: RuPay,
  Maestro: Maestro,
  UnionPay: UnionPay,
  Default: Master,
};

const CustomerOrderPayment: React.FC<CustomerOrderPaymentProps> = ({
  isOpen,
  onClose,
  order,
  onClick,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardType, setCardType] = useState("Default");
  const [zipCode, setZipCode] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [maxCardLength, setMaxCardLength] = useState(19);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  if (!order) return null;
  const subTotal = order.orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
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
      const formatPattern = getCardFormat(matchedCard.name, maxDigits);
      const spaces = formatPattern.length - 1;

      setMaxCardLength(maxDigits + spaces);
      setCardType(matchedCard.name);
    } else {
      setCardType("Default");
      setMaxCardLength(19);
    }
  };
  const formatCardNumber = (text: string) => {
    // Keep track if user removed last character
    const isBackspacing =
      cardNumber.length > text.length && cardNumber.endsWith(" ");

    // Clean the input first
    let cleaned = text
      .replace(/[^\d\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    let digitsOnly = cleaned.replace(/\s/g, "");

    // If backspacing and last char was space, remove the last digit group too
    if (isBackspacing) {
      digitsOnly = digitsOnly.slice(0, -1);
    }

    // Find matched card based on prefix
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

    // Get format pattern
    const formatPattern = matchedCard
      ? getCardFormat(matchedCard.name, digitsOnly.length)
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
    const input = e.target.value;
    let formatted = expiryDate;
    const isBackSpace = input.length < expiryDate.length;

    if (!isBackSpace) {
      const newChar = input.slice(-1);

      if (expiryDate.length === 0) {
        if (newChar === "0" || newChar === "1") {
          formatted = newChar;
        } else {
          formatted = "0" + newChar + "/";
        }
      } else if (expiryDate.length === 1) {
        const month = parseInt(expiryDate + newChar, 10);
        if (month <= 12) {
          formatted = expiryDate + newChar + "/";
        } else {
          formatted = "0" + expiryDate + "/" + newChar;
        }
      } else {
        // After slash, just append
        formatted = input;
      }
    } else {
      // Handle backspace
      if (expiryDate.length === 3) {
        // Removing slash
        formatted = expiryDate.slice(0, 2);
      } else {
        formatted = input;
      }
    }

    setExpiryDate(formatted);
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

    if (!zipCode || !/^\d{4,10}$/.test(zipCode)) return false;

    return true;
  };

  const SelectedCardIcon: React.FC = cardImages[cardType] || cardImages.Default;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<Card />}
      title="Complete Payment"
      subtitle={"Your payment information is secure and encrypted"}
      position={ModalPosition.RIGHT}
    >
      {order && (
        <div className="w-full max-w-2xl mx-auto gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-950">
              Order #{order.orderNumber}
            </h2>
            <span className="text-primary text-sm font-semibold">
              {order.orderItems.length.toString().padStart(2, "0")} Items
            </span>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-gray-100 rounded-xl p-1.5 gap-2"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg flex items-center justify-center">
                    <Image
                      alt="#"
                      src={"/images/products/p1.png"}
                      width={1024}
                      height={1024}
                    />
                  </div>
                  <span className="text-sm font-normal text-gray-800 pr-20">
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
          <hr className=" my-3 md:my-4 text-gray-200" />
          <div className="flex flex-col gap-2">
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
              <span className="text-sm font-medium text-gray-800">${tax}</span>
            </div>
          </div>
          <hr className=" my-3 md:my-4 text-gray-200" />
          <div className="flex justify-between items-center">
            <span className="text-base font-medium text-gray-800">Total</span>
            <span className="text-base font-semibold text-primary">
              ${total}
            </span>
          </div>
          <hr className=" my-3 md:my-4 text-gray-200" />
          <form className="mx-auto flex flex-col gap-4">
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
              icon={<SelectedCardIcon />}
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
                  maxLength={5}
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
                  onChange={(e) => setCvv(e.target.value)}
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
          <div className="flex mt-4 gap-6 border-t border-gray-200 pt-4">
            <div className="flex-1">
              <ThemeButton
                label={"Cancel"}
                variant="outline"
                heightClass="h-11"
              />
            </div>
            <div className="flex-1">
              <ThemeButton
                label={`Pay $${total}`}
                variant="filled"
                onClick={onClick}
                heightClass="h-11"
                disabled={!isAnyFieldValid()}
              />
            </div>
          </div>
        </div>
      )}
    </AppModal>
  );
};

export default CustomerOrderPayment;
