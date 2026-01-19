import AppModal, { ModalPosition } from "./AppModal";
import { useEffect, useState } from "react";
import Image from "next/image";
import Card from "../../../../../public/icons/Card";
import ThemeInput from "../inputs/ThemeInput";
import { GoogleAutocompleteInput } from "@/app/components";
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
import { getToken, AcceptOpaqueData } from "@/lib/authorizeNet";
import { useMutation } from "@apollo/client";
import { PROCESS_PAYMENT, CALCULATE_TAX } from "@/lib/graphql/mutations";
import { useAppSelector } from "@/lib/store/hooks";

type OrderItem = {
  id: string | number;
  medicineName: string;
  amount: string;
  quantity: number;
  price: number;
};

type order = {
  id: string | number;
  displayId: string;
  doctorName: string;
  orderedOn: string;
  shippingAddress?: string;
  isDueToday?: string;
  totalPrice: number;
  orderItems: OrderItem[];
  subtotalPrice?: number | null;
  totalTax?: number | null;
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
  onClick: (token: AcceptOpaqueData) => unknown | Promise<unknown>;
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
  const { user } = useAppSelector((state) => state.auth);

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardType, setCardType] = useState("Default");
  // Billing address - optimized
  const [billingAddress, setBillingAddress] = useState({
    street1: "",
    street2: "",
    city: "",
    state: "",
    postalCode: "",
  });
  // Shipping address - optimized
  const [useDifferentShipping, setUseDifferentShipping] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street1: "",
    street2: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [maxCardLength, setMaxCardLength] = useState(19);
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expiryError, setExpiryError] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [calculatedTax, setCalculatedTax] = useState<number | null>(null);
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);
  const [isCalculatingTax, setIsCalculatingTax] = useState(false);
  const [taxError, setTaxError] = useState("");

  useBodyScrollLock(isOpen);
  const [processPaymentMutation] = useMutation(PROCESS_PAYMENT);
  const [calculateTaxMutation] = useMutation(CALCULATE_TAX);

  // Helper function to truncate postal code to 5 digits
  const truncatePostalCode = (code: string): string => {
    const digitsOnly = code.replace(/\D/g, "");
    return digitsOnly.slice(0, 5);
  };

  // Function to calculate tax with retry logic
  const calculateTaxWithRetry = async (
    postalCode: string,
    subtotalPrice: number,
    retries = 2
  ): Promise<void> => {
    if (!postalCode || postalCode.length !== 5) {
      return;
    }

    setIsCalculatingTax(true);
    setTaxError("");

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { data } = await calculateTaxMutation({
          variables: {
            clientMutationId: user?.id ? String(user.id) : null,
            subtotalPrice: subtotalPrice,
            postalCode: postalCode,
          },
        });

        if (data?.calculateTax?.success) {
          setCalculatedTax(data.calculateTax.taxAmount);
          setCalculatedTotal(data.calculateTax.totalPrice);
          setTaxError("");
          setIsCalculatingTax(false);
          return;
        } else {
          throw new Error("Tax calculation failed");
        }
      } catch (error) {
        if (attempt === retries) {
          // Last attempt failed
          setTaxError(
            typeof error === "string"
              ? error
              : error instanceof Error
              ? error.message
              : "Failed to calculate tax. Please try again."
          );
          setIsCalculatingTax(false);
          // Reset to original values on error
          setCalculatedTax(null);
          setCalculatedTotal(null);
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
          );
        }
      }
    }
  };

  // Reset calculated tax values when modal closes or order changes
  useEffect(() => {
    if (!isOpen) {
      setCalculatedTax(null);
      setCalculatedTotal(null);
      setTaxError("");
    }
  }, [isOpen]);

  // Set default values from user profile when modal opens
  useEffect(() => {
    if (isOpen && user) {
      // Set billing address fields from user's address fields
      if (user.street1 && !billingAddress.street1) {
        setBillingAddress({
          street1: user.street1,
          street2: user.street2 || "",
          city: user.city || "",
          state: user.state || "",
          postalCode: user.postalCode
            ? truncatePostalCode(user.postalCode)
            : "",
        });
      }

      // Set shipping address to same as billing by default
      if (user.street1 && !shippingAddress.street1) {
        setShippingAddress({
          street1: user.street1,
          street2: user.street2 || "",
          city: user.city || "",
          state: user.state || "",
          postalCode: user.postalCode
            ? truncatePostalCode(user.postalCode)
            : "",
        });
      }

      // Set cardholder name from user's full name
      if (user.fullName && !cardHolderName) {
        setCardHolderName(user.fullName);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  // Sync shipping address with billing when checkbox is unchecked
  useEffect(() => {
    if (!useDifferentShipping) {
      setShippingAddress(billingAddress);
    }
  }, [useDifferentShipping, billingAddress]);

  // Handler for shipping address checkbox
  const handleShippingAddressToggle = (checked: boolean) => {
    setUseDifferentShipping(checked);
    if (checked) {
      // Prefill shipping address from user object when checkbox is checked
      // Priority: user shipping data > billing address > empty
      const hasShippingData = user?.shippingStreet1 || user?.shippingCity;
      const wasSameAsBilling = user?.sameAsBillingAddress ?? true;
      const shippingStreet1 =
        user?.shippingStreet1 ||
        (wasSameAsBilling && !hasShippingData ? billingAddress.street1 : "");
      const shippingStreet2 =
        user?.shippingStreet2 ||
        (wasSameAsBilling && !hasShippingData ? billingAddress.street2 : "");
      const shippingCity =
        user?.shippingCity ||
        (wasSameAsBilling && !hasShippingData ? billingAddress.city : "");
      const shippingState =
        user?.shippingState ||
        (wasSameAsBilling && !hasShippingData ? billingAddress.state : "");
      const shippingPostalCode = user?.shippingPostalCode
        ? truncatePostalCode(user.shippingPostalCode)
        : wasSameAsBilling && !hasShippingData
        ? billingAddress.postalCode
        : "";

      setShippingAddress({
        street1: shippingStreet1,
        street2: shippingStreet2,
        city: shippingCity,
        state: shippingState,
        postalCode: shippingPostalCode,
      });
    }
    // When unchecked, useEffect will sync with billing address
  };

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

  // Watch for billing postal code changes and calculate tax
  useEffect(() => {
    if (!order || !isOpen) return; // Only calculate tax for orders, not requests

    const postalCode = billingAddress.postalCode;
    const truncatedPostal = truncatePostalCode(postalCode);

    if (truncatedPostal.length === 5) {
      const subtotal =
        order?.subtotalPrice ??
        order?.orderItems?.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        ) ??
        0;
      void calculateTaxWithRetry(truncatedPostal, subtotal);
    } else {
      // Reset calculated values if postal code is not 5 digits
      setCalculatedTax(null);
      setCalculatedTotal(null);
      setTaxError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingAddress.postalCode, order, isOpen]);

  const handleContinue = () => {
    setShowForm(true);
  };

  if (!order && !request) return null;

  const subTotal =
    order?.orderItems?.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    ) ??
    request?.price ??
    0;

  // Use calculated tax/total if available, otherwise fall back to defaults
  const taxAmount =
    calculatedTax !== null ? calculatedTax : order?.totalTax ?? 0;
  const tax = taxAmount.toFixed(2);
  const total =
    calculatedTotal !== null
      ? calculatedTotal
      : order?.totalPrice ?? subTotal + taxAmount;

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

    // American Express requires 4-digit CVV, others require 3-digit
    const requiredCvvLength = cardType === "American" ? 4 : 3;
    const isCvvValid = cvv.length === requiredCvvLength;
    if (!cvv || !isCvvValid || !/^\d+$/.test(cvv)) return false;

    if (!cardHolderName || cardHolderName.trim() === "") return false;

    // Validate billing address
    if (!billingAddress.street1 || billingAddress.street1.trim() === "")
      return false;
    if (!billingAddress.city || billingAddress.city.trim() === "") return false;
    if (!billingAddress.state || billingAddress.state.trim() === "")
      return false;
    const truncatedBillingPostal = truncatePostalCode(
      billingAddress.postalCode
    );
    if (!truncatedBillingPostal || truncatedBillingPostal.length !== 5)
      return false;

    // Validate shipping address if different from billing
    if (useDifferentShipping) {
      if (!shippingAddress.street1 || shippingAddress.street1.trim() === "")
        return false;
      if (!shippingAddress.city || shippingAddress.city.trim() === "")
        return false;
      if (!shippingAddress.state || shippingAddress.state.trim() === "")
        return false;
      const truncatedShippingPostal = truncatePostalCode(
        shippingAddress.postalCode
      );
      if (!truncatedShippingPostal || truncatedShippingPostal.length !== 5)
        return false;
    }

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

  const handlePaymentSubmit = async () => {
    if (!showForm && window.innerWidth < 768) {
      handleContinue();
      return;
    }

    if (!isAnyFieldValid() || cardType === "Default" || isProcessing) {
      validateExpiry(expiryDate);
      validateCardNumber(cardNumber, cardType as CardType);
      return;
    }

    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    const [month, year] = expiryDate.split("/");

    setPaymentError("");
    setIsProcessing(true);

    try {
      const token = await getToken({
        cardNumber: cleanCardNumber,
        expiryMonth: month,
        expiryYear: year,
        cvv,
      });
      if (order?.id) {
        const amountValue = total;

        if (
          !Number.isFinite(amountValue) ||
          (amountValue && amountValue <= 0)
        ) {
          throw new Error("Invalid order amount");
        }

        // Truncate postal codes to 5 digits
        const truncatedBillingPostal = truncatePostalCode(
          billingAddress.postalCode
        );
        const truncatedShippingPostal = useDifferentShipping
          ? truncatePostalCode(shippingAddress.postalCode)
          : truncatedBillingPostal;

        // Format billing address
        const billingAddressInput =
          cardHolderName ||
          billingAddress.street1 ||
          billingAddress.city ||
          billingAddress.state ||
          truncatedBillingPostal
            ? {
                address1: billingAddress.street1.trim() || null,
                address2: billingAddress.street2.trim() || null,
                city: billingAddress.city.trim() || null,
                state: billingAddress.state.trim() || null,
                postalCode: truncatedBillingPostal || null,
                country: null,
              }
            : null;

        // Format shipping address
        // If useDifferentShipping is false, use billing address as shipping address
        const finalShippingStreet1 = useDifferentShipping
          ? shippingAddress.street1
          : billingAddress.street1;
        const finalShippingStreet2 = useDifferentShipping
          ? shippingAddress.street2
          : billingAddress.street2;
        const finalShippingCity = useDifferentShipping
          ? shippingAddress.city
          : billingAddress.city;
        const finalShippingState = useDifferentShipping
          ? shippingAddress.state
          : billingAddress.state;
        const finalShippingPostal = useDifferentShipping
          ? truncatedShippingPostal
          : truncatedBillingPostal;

        const shippingAddressInput = {
          address1: finalShippingStreet1.trim() || null,
          address2: finalShippingStreet2.trim() || null,
          city: finalShippingCity.trim() || null,
          state: finalShippingState.trim() || null,
          postalCode: finalShippingPostal || null,
          country: null,
        };

        const { data } = await processPaymentMutation({
          variables: {
            orderId: String(order.id),
            amount: amountValue,
            taxAmount: taxAmount,
            opaqueData: {
              dataDescriptor: token.dataDescriptor,
              dataValue: token.dataValue,
            },
            billingAddress: billingAddressInput,
            shippingAddress: shippingAddressInput,
          },
        });

        if (!data?.processPayment?.success) {
          throw new Error("Unable to process payment");
        }
      }
      await Promise.resolve(onClick(token));
    } catch (error) {
      setPaymentError(
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Unable to process payment"
      );
    } finally {
      setIsProcessing(false);
    }
  };

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
        void handlePaymentSubmit();
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
        ((showForm || !isMobile) &&
          (!isAnyFieldValid() || cardType === "Default")) ||
        isProcessing ||
        (order && !!taxError)
      }
      confirmLabel={
        isProcessing
          ? "Processing..."
          : isMobile && !request
          ? showForm
            ? `Pay $${typeof total === "number" ? total.toFixed(2) : total}`
            : "Continue"
          : request || isMobile
          ? "Pay Now"
          : `Pay $${typeof total === "number" ? total.toFixed(2) : total}`
      }
      btnFullWidth={true}
    >
      {(order || request) && (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
          {order ? (
            <div className={`${showForm ? "hidden" : "block"} md:block`}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-950">
                  Order #{order.displayId}
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
                          unoptimized
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
                    ${order?.subtotalPrice?.toFixed(2) ?? subTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-gray-800">
                    Tax
                    {isCalculatingTax && (
                      <span className="text-xs text-gray-500 ml-2">
                        (calculating...)
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    ${taxAmount.toFixed(2)}
                  </span>
                </div>
                {taxError && (
                  <div className="text-xs text-red-600 mt-1">
                    {taxError}
                    <span className="block mt-1">
                      Please try changing the billing postal code and try again.
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-3 md:py-4">
                <span className="text-base font-medium text-gray-800">
                  Total
                </span>
                <span className="text-base font-semibold text-primary">
                  ${typeof total === "number" ? total.toFixed(2) : total}
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
            {paymentError && (
              <p className="text-sm text-red-600 font-medium">{paymentError}</p>
            )}
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
                    const value = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 4);
                    setCvv(value);
                  }}
                  maxLength={4}
                />
              </div>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Billing Address
              </h3>
              <div className="space-y-4">
                <GoogleAutocompleteInput
                  name="street1"
                  value={billingAddress.street1}
                  onChange={(value) => {
                    setBillingAddress((prev) => ({
                      ...prev,
                      street1: value,
                    }));
                  }}
                  onAddressSelect={(address) => {
                    const truncated = truncatePostalCode(address.postalCode);
                    setBillingAddress({
                      street1: address.street1,
                      street2: billingAddress.street2,
                      city: address.city,
                      state: address.state,
                      postalCode: truncated,
                    });
                  }}
                  placeholder="Enter street address"
                  label="Street Address"
                />
                <ThemeInput
                  id="street2"
                  label="Street Address 2 (Optional)"
                  name="street2"
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={billingAddress.street2}
                  onChange={(e) =>
                    setBillingAddress((prev) => ({
                      ...prev,
                      street2: e.target.value,
                    }))
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ThemeInput
                    id="city"
                    label="City"
                    name="city"
                    type="text"
                    placeholder="Enter city"
                    value={billingAddress.city}
                    onChange={(e) =>
                      setBillingAddress((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                  />
                  <ThemeInput
                    id="state"
                    label="State"
                    name="state"
                    type="text"
                    placeholder="Enter state"
                    value={billingAddress.state}
                    onChange={(e) =>
                      setBillingAddress((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                  />
                </div>
                <ThemeInput
                  id="postalCode"
                  label="Postal Code"
                  name="postalCode"
                  type="text"
                  placeholder="Enter postal code"
                  value={billingAddress.postalCode}
                  onChange={(e) => {
                    const truncated = truncatePostalCode(e.target.value);
                    setBillingAddress((prev) => ({
                      ...prev,
                      postalCode: truncated,
                    }));
                  }}
                  maxLength={5}
                />
              </div>
            </div>
            {/* Shipping Address Section */}
            <div className="">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="useDifferentShipping"
                  checked={useDifferentShipping}
                  onChange={(e) =>
                    handleShippingAddressToggle(e.target.checked)
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label
                  htmlFor="useDifferentShipping"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Ship to a different address
                </label>
              </div>

              {useDifferentShipping && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    Shipping Address
                  </h3>
                  <div className="space-y-4">
                    <GoogleAutocompleteInput
                      name="shippingStreet1"
                      value={shippingAddress.street1}
                      onChange={(value) => {
                        setShippingAddress((prev) => ({
                          ...prev,
                          street1: value,
                        }));
                      }}
                      onAddressSelect={(address) => {
                        const truncated = truncatePostalCode(
                          address.postalCode
                        );
                        setShippingAddress({
                          street1: address.street1,
                          street2: shippingAddress.street2,
                          city: address.city,
                          state: address.state,
                          postalCode: truncated,
                        });
                      }}
                      placeholder="Enter street address"
                      label="Street Address"
                    />
                    <ThemeInput
                      id="shippingStreet2"
                      label="Street Address 2 (Optional)"
                      name="shippingStreet2"
                      type="text"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={shippingAddress.street2}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          street2: e.target.value,
                        }))
                      }
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ThemeInput
                        id="shippingCity"
                        label="City"
                        name="shippingCity"
                        type="text"
                        placeholder="Enter city"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                      />
                      <ThemeInput
                        id="shippingState"
                        label="State"
                        name="shippingState"
                        type="text"
                        placeholder="Enter state"
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <ThemeInput
                      id="shippingPostalCode"
                      label="Postal Code"
                      name="shippingPostalCode"
                      type="text"
                      placeholder="Enter postal code"
                      value={shippingAddress.postalCode}
                      onChange={(e) => {
                        const truncated = truncatePostalCode(e.target.value);
                        setShippingAddress((prev) => ({
                          ...prev,
                          postalCode: truncated,
                        }));
                      }}
                      maxLength={5}
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </AppModal>
  );
};

export default CustomerOrderPayment;
