"use client";
import React, { ReactNode } from "react";
import {
  BubbleChatIcon,
  CreditCardOutlineIcon,
  OrdersIcon,
  ShoppingCartIcon,
} from "@/icons";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { Header } from "../components";
import { useAppSelector } from "@/lib/store/hooks";

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
    label: "Pending Payments",
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
  "/chat": "Chat with Your Physician",
  "/profile": "Profile",
  "/customer-requests": "Requests",
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
  "/profile",
  "/customer-requests",
];

const showSubHeading = ["/reminder", "/requests"];

export default function AuthLayout({ children }: AuthLayoutProps) {
  const user = useAppSelector((state) => state.auth.user);
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
    <div className={`w-full min-h-screen xl:p-4 ${poppins_init.className}`}>
      <div className="px-2 py-3 md:p-4 md:pb-6 lg:p-5 lg:mb-6 lg:pb-10 h-fit mb-2 md:mb-4 flex flex-col gap-5 md:gap-10 relative  items-center justify-center bg-black/40  xl:rounded-[20px] !bg-[url(/images/bannerImage.png)] !bg-center w-full !bg-cover !bg-no-repeat ">
        <Header menuItems={menuItems} />

        <div className="flex items-center flex-col">
          {pathname.startsWith(menuItems[0].href) && (
            <h2 className="text-white font-normal mb-3 text-base md:text-2xl">
              👋 Welcome {user?.fullName}
            </h2>
          )}
          {hideStats && (
            <h2 className="text-white text-2xl font-semibold md:text-4xl xl:text-[44px]">
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
      <main className="px-3  pb-3">{children}</main>
    </div>
  );
}
