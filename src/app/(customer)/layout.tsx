"use client";
import React, { ReactNode } from "react";
import { DashboardStats, Header } from "../components";
import {
  BubbleChatIcon,
  CreditCardOutlineIcon,
  InventoryIcon,
  OrdersIcon,
  ShoppingCartIcon,
  SyrupIcon,
} from "@/icons";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";

interface AuthLayoutProps {
  children: ReactNode;
}

const poppins_init = Poppins({
  style: ["normal"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--poppins",
});

const menuItems = [
  {
    label: "pending-payments",
    href: "/pending-payments",
    icon: CreditCardOutlineIcon,
  },
  { label: "Order History", href: "/order-history", icon: OrdersIcon },
  {
    label: "Browse Products",
    href: "/browse-products",
    icon: ShoppingCartIcon,
  },
  {
    label: "Chat with Physician",
    href: "/chat",
    icon: BubbleChatIcon,
  },
];

const headings: Record<string, string> = {
  "/pending-payments": "Trusted Peptide Solutions",
  "/order-history": "Order History",
  "/browse-products": "Browse Products",
  "/chat": "",
};

const subHeadings: Record<string, string> = {
  "/reminder": "Customers who haven't ordered specific products in 30-45 days",
  "/requests": "Review and manage patient medication requests",
};

const noStatsRoutes = [
  "/pending-payments",
  "/order-history",
  "/browse-products",
  "/chat",
];

const showSubHeading = ["/reminder", "/requests"];

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const heading =
    Object.keys(headings).find((key) => pathname.startsWith(key)) !== undefined
      ? headings[Object.keys(headings).find((key) => pathname.startsWith(key))!]
      : "";

  const subheading =
    Object.keys(subHeadings).find((key) => pathname.startsWith(key)) !==
    undefined
      ? subHeadings[
          Object.keys(subHeadings).find((key) => pathname.startsWith(key))!
        ]
      : "";

  const hideStats = noStatsRoutes.some((route) => pathname.startsWith(route));
  const showSubHeads = showSubHeading.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <div className={`w-full min-h-screen p-4 ${poppins_init.className}`}>
      <div className="p-4 pb-6 h-fit mb-2 md:mb-4 flex flex-col gap-6 md:gap-10 relative  items-center justify-center bg-black/40  rounded-2xl !bg-[url(/images/bannerImage.png)] !bg-center w-full !bg-cover !bg-no-repeat ">
        <Header menuItems={menuItems} />

        <div className="flex items-center flex-col">
          {pathname.startsWith(menuItems[0].href) && (
            <h2 className="text-white font-normal mb-3 text-base md:text-2xl">
              👋 Welcome Daniel,
            </h2>
          )}
          {hideStats && (
            <h2 className="text-white text-2xl font-semibold md:text-4xl">
              {heading}
            </h2>
          )}
          {showSubHeads && (
            <h2 className="text-white/80 mt-1 text-base  md:text-xl">
              {subheading}
            </h2>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
