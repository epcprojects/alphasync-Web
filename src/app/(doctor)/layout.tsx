"use client";
import React, { ReactNode } from "react";
import { DashboardStats, Header } from "../components";
import { SyrupIcon } from "@/icons";
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

const headings: Record<string, string> = {
  "/inventory": "Trusted Peptide Solutions",
  "/customers": "Customer Management",
  "/orders": "Order Management",
  "/reminder": "Refill Reminders",
  "/request": "Patient Requests",
  "/settings": "Settings",
  "/pending-payments": "Trusted Peptide Solutions",
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

  return (
    <div className={`w-full min-h-screen p-4 ${poppins_init.className}`}>
      <div className="p-4 pb-6 h-fit mb-2 md:mb-4 flex flex-col gap-6 md:gap-10 relative  items-center justify-center bg-black/40  rounded-2xl !bg-[url(/images/bannerImage.png)] !bg-center w-full !bg-cover !bg-no-repeat ">
        <Header />

        {!hideStats && (
          <DashboardStats
            showUserName={pathname.startsWith("/orders") ? false : true}
            username={"Arina"}
            heading={heading}
            stats={[
              {
                label: "Sales This Year",
                value: "$67,890.41",
                icon: <SyrupIcon />,
                bgColor: "bg-purple-500",
              },
              {
                label: "Sales This Month",
                value: "$8,932.12",
                icon: <SyrupIcon />,
                bgColor: "bg-emerald-500",
              },
              {
                label: "Sales This Week",
                value: "$2,114.77",
                icon: <SyrupIcon />,
                bgColor: "bg-pink-500",
              },
              {
                label: "Top Ordered Product",
                value: "BPC-157",
                icon: <SyrupIcon />,
                bgColor: "bg-orange-400",
              },
            ]}
          />
        )}
        <div className="flex items-center flex-col">
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
