"use client";
import React, { ReactNode } from "react";
import { DashboardStats, Header, AdminRoute } from "../components";
import { OrdersIcon, DashDoctor, PackageIcon } from "@/icons";
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
  {
    label: "Doctors",
    href: "/admin/doctors",
    icon: OrdersIcon,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: PackageIcon,
  },
  { label: "Settings", href: "/admin/settings", icon: OrdersIcon },
];

const headings: Record<string, string> = {
  "/admin/doctors": "Trusted Peptide Solutions",
  "/admin/products": "Product Management",
  "/admin/settings": "Settings",
};

const noStatsRoutes = ["/admin/settings"];

export default function AuthLayout({ children }: AuthLayoutProps) {
  const user = useAppSelector((state) => state.auth.user);

  const pathname = usePathname();
  const heading =
    Object.keys(headings).find((key) => pathname.startsWith(key)) !== undefined
      ? headings[Object.keys(headings).find((key) => pathname.startsWith(key))!]
      : "";
  const hideStats = noStatsRoutes.some((route) => pathname.startsWith(route));
  const isMobile = useIsMobile();

  return (
    <AdminRoute>
      <div className={`w-full min-h-screen xl:p-4 ${poppins_init.className}`}>
        <div className="px-2 py-3 md:p-4 lg:p-5 md:pb-6 lg:mb-6 lg:pb-10 h-fit mb-2 md:mb-4 flex flex-col gap-5 md:gap-10 relative  items-center justify-center bg-black/40  xl:rounded-[20px] !bg-[url(/images/bannerImage.png)] !bg-center w-full !bg-cover !bg-no-repeat ">
          <Header menuItems={menuItems} />

          {!hideStats && (
            <DashboardStats
              showUserName={pathname.startsWith("/orders") ? false : true}
              username={user?.fullName || "----"}
              heading={heading}
              stats={[
                {
                  label: "Total Doctors",
                  value: "128",
                  icon: (
                    <DashDoctor
                      height={isMobile ? "16" : "32"}
                      width={isMobile ? "16" : "32"}
                    />
                  ),
                  bgColor: "bg-purple-500",
                },
                {
                  label: "Active Doctors",
                  value: "102",
                  icon: (
                    <DashDoctor
                      height={isMobile ? "16" : "32"}
                      width={isMobile ? "16" : "32"}
                    />
                  ),
                  bgColor: "bg-emerald-400",
                },
                {
                  label: "Inactive Doctors",
                  value: "26",
                  icon: (
                    <DashDoctor
                      height={isMobile ? "16" : "32"}
                      width={isMobile ? "16" : "32"}
                    />
                  ),
                  bgColor: "bg-pink-400",
                },
                {
                  label: "New This Month",
                  value: "08",
                  icon: (
                    <DashDoctor
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
            </div>
          )}
        </div>
        <main className="px-3  pb-3">{children}</main>
      </div>
    </AdminRoute>
  );
}
