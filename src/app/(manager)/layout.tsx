"use client";
import React, { ReactNode } from "react";
import { DashboardStats, Header } from "../components";
import {
  ShoppingCartIcon,
  AccountingIcon,
  DoctorFilledIcon,
  SyrupIcon,
  PercentIcon,
  ShoppingCardDualIcon,
  CoinsIcon,
  DollarCircleIcon,
} from "@/icons";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { useIsMobile } from "@/hooks/useIsMobile";
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
  { label: "Shops", href: "/manager-shop", icon: ShoppingCartIcon },
  { label: "Accounting", href: "/manager-accounting", icon: AccountingIcon },
];

const headings: Record<string, string> = {
  "/manager-shop": "Trusted Peptide Solutions",
  "/manager-accounting": "Trusted Peptide Solutions",
};

const subHeadings: Record<string, string> = {
  //   "/reminder": "Customers who haven't ordered specific products in 30-45 days",
  //   "/requests": "Review and manage patient medication requests",
};

const noStatsRoutes: string[] = [

];

const showSubHeading: string[] = [

];

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
    pathname.startsWith(route),
  );

  const isMobile = useIsMobile();
  const isDynamicManagerPage = /^\/manager-shop\/.+/.test(pathname);
  const isDynamicAccountingPage = /^\/manager-accounting\/.+/.test(pathname);
  const stats = [
    {
      label: "Total Doctors",
      value: "128",
      icon: (
        <DoctorFilledIcon
          height={isMobile ? 20 : 32}
          width={isMobile ? 20 : 32}
          fill="#FFFFFF"
        />
      ),
      bgColor: "bg-purple-500",
    },
    {
      label: "Active Doctors",
      value: "102",
      icon: (
        <DoctorFilledIcon
          height={isMobile ? 20 : 32}
          width={isMobile ? 20 : 32}
          fill="#FFFFFF"
        />
      ),
      bgColor: "bg-emerald-400",
    },
    {
      label: "Inactive Doctors",
      value: "26",
      icon: (
        <DoctorFilledIcon
          height={isMobile ? 20 : 32}
          width={isMobile ? 20 : 32}
          fill="#FFFFFF"
        />
      ),
      bgColor: "bg-pink-400",
    },
    {
      label: "New This Month",
      value: "08",
      icon: (
        <DoctorFilledIcon
          height={isMobile ? 20 : 32}
          width={isMobile ? 20 : 32}
          fill="#FFFFFF"
        />
      ),
      bgColor: "bg-orange-400",
    },
  ];
  const dynamicShopStats = [
    {
      label: "Sales This Year",
      value: "$67,890.41",
      icon: (
        <SyrupIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-purple-500",
    },
    {
      label: "Sales This Month",
      value: "$8,932.12",
      icon: (
        <SyrupIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-emerald-400",
    },
    {
      label: "Sales This Week",
      value: "$2,114.77 ",
      icon: (
        <SyrupIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-pink-400",
    },
    {
      label: "Top Ordered Product",
      value: "BPC-157",
      icon: (
        <SyrupIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-orange-400",
    },
  ];
  const dynamicAccountingStats = [
    {
      label: "Total Revenue",
      value: "$48,346",
      icon: (
        <DollarCircleIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-purple-500",
    },
    {
      label: "Net Profit",
      value: "$13,510",
      icon: (
        <CoinsIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-emerald-400",
    },
    {
      label: "Total Orders",
      value: "25 ",
      icon: (
        <ShoppingCardDualIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-pink-400",
    },
    {
      label: "Avg. Markup",
      value: "38.8%",
      icon: (
        <PercentIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-orange-400",
    },
  ];
  const currentStats = isDynamicAccountingPage
    ? dynamicAccountingStats
    : isDynamicManagerPage
      ? dynamicShopStats
      : stats;

  return (
    <div className={`w-full min-h-screen xl:p-4 ${poppins_init.className}`}>
      <div className="px-2 py-3 md:p-4 md:pb-6 lg:mb-6 lg:pb-10 h-fit mb-2 md:mb-4 flex lg:p-5 flex-col gap-5 md:gap-10 relative  items-center justify-center bg-black/40  xl:rounded-[20px] !bg-[url(/images/bannerImage.png)] !bg-center w-full !bg-cover !bg-no-repeat ">
        <Header menuItems={menuItems} />
        {!hideStats && (
          <DashboardStats
            showWelcome
            showUserName={true}
            username={user?.fullName || "noname"}
            heading={heading}
            stats={currentStats}
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
      <main className="px-2  pb-2">{children}</main>
    </div>
  );
}
