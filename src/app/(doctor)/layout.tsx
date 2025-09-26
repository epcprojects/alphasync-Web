"use client";
import React, { ReactNode } from "react";
import { DashboardStats, Header } from "../components";
import {
  SyrupIcon,
  InventoryIcon,
  CustomerIcon,
  OrdersIcon,
  ReminderIcon,
  RequestIcon,
  SettingsIcon,
} from "@/icons";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { useIsMobile } from "@/hooks/useIsMobile";

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
  { label: "Inventory", href: "/inventory", icon: InventoryIcon },
  { label: "Customers", href: "/customers", icon: CustomerIcon },
  { label: "Orders", href: "/orders", icon: OrdersIcon },
  {
    label: "Reminder",
    href: "/reminder",
    icon: ReminderIcon,
  },
  { label: "Requests", href: "/requests", icon: RequestIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

const headings: Record<string, string> = {
  "/inventory": "Trusted Peptide Solutions",
  "/customers": "Customer Management",
  "/orders": "Order Management",
  "/reminder": "Refill Reminders",
  "/request": "Patient Requests",
  "/settings": "Settings",
};

const subHeadings: Record<string, string> = {
  "/reminder": "Customers who haven't ordered specific products in 30-45 days",
  "/requests": "Review and manage patient medication requests",
};

const noStatsRoutes = ["/customers", "/reminder", "/requests", "/settings"];

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

  const isMobile = useIsMobile();

  return (
    <div className={`w-full min-h-screen xl:p-4 ${poppins_init.className}`}>
      <div className="px-2 py-3 md:p-4 md:pb-6 lg:mb-6 lg:pb-10 h-fit mb-2 md:mb-4 flex lg:p-5 flex-col gap-5 md:gap-10 relative  items-center justify-center bg-black/40  xl:rounded-[20px] !bg-[url(/images/bannerImage.png)] !bg-center w-full !bg-cover !bg-no-repeat ">
        <Header menuItems={menuItems} />

        {!hideStats && (
          <DashboardStats
            showUserName={pathname.startsWith("/orders") ? false : true}
            username={"Arina"}
            heading={heading}
            stats={[
              {
                label: "Sales This Year",
                value: "$67,890.41",
                icon: (
                  <SyrupIcon
                    height={isMobile ? "16" : "32"}
                    width={isMobile ? "16" : "32"}
                  />
                ),
                bgColor: "bg-purple-500",
              },
              {
                label: "Sales This Month",
                value: "$8,932.12",
                icon: (
                  <SyrupIcon
                    height={isMobile ? "16" : "32"}
                    width={isMobile ? "16" : "32"}
                  />
                ),
                bgColor: "bg-emerald-400",
              },
              {
                label: "Sales This Week",
                value: "$2,114.77",
                icon: (
                  <SyrupIcon
                    height={isMobile ? "16" : "32"}
                    width={isMobile ? "16" : "32"}
                  />
                ),
                bgColor: "bg-pink-400",
              },
              {
                label: "Top Ordered Product",
                value: "BPC-157",
                icon: (
                  <SyrupIcon
                    height={isMobile ? "16" : "32"}
                    width={isMobile ? "16" : "32"}
                  />
                ),
                bgColor: "bg-orange-400",
              },
            ]}
          />
        )}
        {hideStats && (
          <div className="flex items-center flex-col">
            {hideStats && (
              <h2 className="text-white text-2xl font-semibold md:text-4xl xl:text-[44px]">
                {heading}
              </h2>
            )}
            {showSubHeads && (
              <h2 className="text-white/80 mt-1 text-base text-center md:text-xl">
                {subheading}
              </h2>
            )}
          </div>
        )}
      </div>
      <div className="px-3  pb-3">{children}</div>
    </div>
  );
}
