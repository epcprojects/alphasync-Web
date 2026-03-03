"use client";
import React, { ReactNode } from "react";
import { Header, ManagerRoute } from "@/app/components";
import { AccountingIcon, Doctor, OrdersIcon, SettingsIcon, UserIcon, DashboardIcon } from "@/icons";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { useAppSelector } from "@/lib/store/hooks";

interface ManagerLayoutProps {
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
    label: "Dashboard",
    href: "/manager/dashboard",
    icon: DashboardIcon,
  },
  {
    label: "Doctors",
    href: "/manager/doctors",
    icon: Doctor,
  },
  {
    label: "Accounting",
    href: "/manager/accounting",
    icon: AccountingIcon,
  },
  {
    label: "Orders",
    href: "/manager/orders",
    icon: OrdersIcon,
  },
];

const headings: Record<string, string> = {
  "/manager/dashboard": "Dashboard",
  "/manager/doctors": "Doctors",
  "/manager/accounting": "Accounting",
  "/manager/orders": "Orders",
  "/manager/profile": "Profile",
  "/manager/settings": "Settings",
};

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  const user = useAppSelector((state) => state.auth.user);
  const pathname = usePathname();
  const heading =
    Object.keys(headings).find((key) => pathname.startsWith(key)) !== undefined
      ? headings[Object.keys(headings).find((key) => pathname.startsWith(key))!]
      : "";

  return (
    <ManagerRoute>
      <div className={`w-full min-h-screen xl:p-4 ${poppins_init.className}`}>
        <div className="px-2 py-3 md:p-4 lg:p-5 md:pb-6 lg:mb-6 lg:pb-10 h-fit mb-2 md:mb-4 flex flex-col gap-5 md:gap-10 relative items-center justify-center bg-black/40 xl:rounded-[20px] !bg-[url(/images/bannerImage.png)] !bg-center w-full !bg-cover !bg-no-repeat">
          <Header menuItems={menuItems} />
          <div className="flex flex-col items-center">
            <h2 className="text-white text-2xl font-semibold md:text-4xl xl:text-[44px]">
              {heading || "Manager"}
            </h2>
            {user?.fullName && (
              <p className="text-white/90 text-sm mt-1">Welcome, {user.fullName}</p>
            )}
          </div>
        </div>
        <main className="px-2 pb-2">{children}</main>
      </div>
    </ManagerRoute>
  );
}
