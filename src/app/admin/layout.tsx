"use client";
import React, { ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { DashboardStats, Header, AdminRoute } from "../components";
import {
  DashDoctor,
  Doctor,
  ShoppingCartIcon,
  DashboardIcon,
  SettingsIcon,
  AdminIcon,
} from "@/icons";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAppSelector } from "@/lib/store/hooks";
import { ADMIN_DASHBOARD } from "@/lib/graphql/queries";

interface AuthLayoutProps {
  children: ReactNode;
}

interface AdminDashboardResponse {
  adminDashboard: {
    totalDoctors: number;
    activeDoctors: number;
    inactiveDoctors: number;
    newDoctorsThisMonth: number;
  };
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
    href: "/admin/dashboard",
    icon: DashboardIcon,
  },
  {
    label: "Doctors",
    href: "/admin/doctors",
    icon: Doctor,
  },
  {
    label: "Admins",
    href: "/admin/admins",
    icon: AdminIcon,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: ShoppingCartIcon,
  },
  {
    label: "Training Videos",
    href: "/admin/training-videos",
    icon: DashboardIcon,
  },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

const headings: Record<string, string> = {
  "/admin/dashboard": "Admin Dashboard",
  "/admin/doctors": "Trusted Peptide Solutions",
  "/admin/admins": "Admin Management",
  "/admin/products": "Product Management",
  "/admin/training-videos": "Training Videos",
  "/admin/settings": "Settings",
};

const noStatsRoutes = [
  "/admin/settings",
  "/admin/dashboard",
  "/admin/admins",
  "/admin/training-videos",
];

const numberFormatter = new Intl.NumberFormat("en-US");

const formatNumber = (value?: number | null) =>
  value === null || value === undefined ? "--" : numberFormatter.format(value);

export default function AuthLayout({ children }: AuthLayoutProps) {
  const user = useAppSelector((state) => state.auth.user);

  const pathname = usePathname();
  const heading =
    Object.keys(headings).find((key) => pathname.startsWith(key)) !== undefined
      ? headings[Object.keys(headings).find((key) => pathname.startsWith(key))!]
      : "";
  const hideStats = noStatsRoutes.some((route) => pathname.startsWith(route));
  const isMobile = useIsMobile();

  const showWelcome = pathname === "/admin/dashboard";

  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useQuery<AdminDashboardResponse>(ADMIN_DASHBOARD, {
    skip: !user?.id,
    fetchPolicy: "network-only",
  });

  if (dashboardError) {
    console.error("Failed to load admin dashboard stats:", dashboardError);
  }

  const stats = [
    {
      label: "Total Doctors",
      value: dashboardLoading
        ? "..."
        : formatNumber(dashboardData?.adminDashboard?.totalDoctors),
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
      value: dashboardLoading
        ? "..."
        : formatNumber(dashboardData?.adminDashboard?.activeDoctors),
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
      value: dashboardLoading
        ? "..."
        : formatNumber(dashboardData?.adminDashboard?.inactiveDoctors),
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
      value: dashboardLoading
        ? "..."
        : formatNumber(dashboardData?.adminDashboard?.newDoctorsThisMonth),
      icon: (
        <DashDoctor
          height={isMobile ? "16" : "32"}
          width={isMobile ? "16" : "32"}
        />
      ),
      bgColor: "bg-orange-400",
    },
  ];

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
              stats={stats}
              showWelcome={showWelcome}
            />
          )}
          {hideStats && (
            <div className="flex items-center flex-col">
              {hideStats && (
                <>
                  {showWelcome && (
                    <h2 className="text-white font-normal mb-4 text-base md:text-2xl">
                      👋 Welcome {user?.fullName || "----"},
                    </h2>
                  )}
                  <h2 className="text-white text-2xl font-semibold md:text-4xl xl:text-[44px]">
                    {heading}
                  </h2>
                </>
              )}
            </div>
          )}
        </div>
        <main className="px-2  pb-2">{children}</main>
      </div>
    </AdminRoute>
  );
}
