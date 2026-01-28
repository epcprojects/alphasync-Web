"use client";
import React, { ReactNode } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { DashboardStats, Header, DoctorRoute, TrainingVideosBlockingPage } from "../components";
import {
  SyrupIcon,
  InventoryIcon,
  CustomerIcon,
  OrdersIcon,
  ReminderIcon,
  RequestIcon,
  SettingsIcon,
  DeliveryBoxIcon,
  RevenueIcon,
  ProfitIcon,
  ShoppingCartIcon,
  ShoppingCardDualIcon,
  PercentIcon,
  DashboardIcon,
} from "@/icons";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { DOCTOR_DASHBOARD } from "@/lib/graphql/queries";
import { MARK_ALL_VIDEOS_AS_VIEWED } from "@/lib/graphql/mutations";
import { setUser } from "@/lib/store/slices/authSlice";

interface AuthLayoutProps {
  children: ReactNode;
}

interface DoctorDashboardResponse {
  doctorDashboard: {
    ordersCount: number;
    totalProfit: number;
    totalSales: number;
    averageOrderValue: number;
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
  { label: "Inventory", href: "/inventory", icon: InventoryIcon },
  { label: "Accounting", href: "/accounting", icon: DashboardIcon },
  { label: "Customers", href: "/customers", icon: CustomerIcon },
  { label: "Orders", href: "/orders", icon: OrdersIcon },
  // { label: "My Clinic", href: "/clinic", icon: DeliveryBoxIcon },
 
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
  "/clinic": "Clinic",
  "/reminder": "Refill Reminders",
  "/request": "Patient Requests",
  "/training-videos": "Training Videos",
  "/settings": "Settings",
  "/notifications": "Notifications",
  "/accounting": "Peptide Accounting",
};

const subHeadings: Record<string, string> = {
  "/reminder": "Customers who haven't ordered specific products in 30-45 days",
  "/requests": "Review and manage patient medication requests",
};

const noStatsRoutes = [
  "/customers",
  "/clinic",
  "/reminder",
  "/requests",
  "/training-videos",
  "/settings",
  "/notifications",
];

const showSubHeading = [
  "/reminder",
  "/requests",
  "/notifications",
  "/accounting",
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US");

const formatCurrency = (value?: number | null) =>
  value === null || value === undefined
    ? "--"
    : currencyFormatter.format(value);

const formatNumber = (value?: number | null) =>
  value === null || value === undefined ? "--" : numberFormatter.format(value);

export default function AuthLayout({ children }: AuthLayoutProps) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  
  // Check if doctor hasn't viewed all videos (allow access to training-videos page)
  const isDoctor = user?.userType?.toLowerCase() === "doctor";
  const hasNotViewedAllVideos = isDoctor && user?.hasViewedAllVideos === false;
  const isTrainingVideosPage = pathname === "/training-videos";
  const shouldShowBlockingPage = hasNotViewedAllVideos && !isTrainingVideosPage;
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

  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useQuery<DoctorDashboardResponse>(DOCTOR_DASHBOARD, {
    skip: !user?.id,
    fetchPolicy: "network-only",
  });

  if (dashboardError) {
    console.error("Failed to load doctor dashboard stats:", dashboardError);
  }

  const hasMyClinic = menuItems.some((item) => item.href.includes("clinic"));

  const stats = [
    {
      label: "Total Sales",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboardData?.doctorDashboard?.totalSales),
      icon: (
        <SyrupIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-purple-500",
    },
    {
      label: "Total Profit",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboardData?.doctorDashboard?.totalProfit),
      icon: (
        <SyrupIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-emerald-400",
    },
    {
      label: "Avg. Order Value",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboardData?.doctorDashboard?.averageOrderValue),
      icon: (
        <SyrupIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-pink-400",
    },
    {
      label: "Orders Count",
      value: dashboardLoading
        ? "..."
        : formatNumber(dashboardData?.doctorDashboard?.ordersCount),
      icon: (
        <SyrupIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-orange-400",
    },
  ];

  // Mutation to mark all videos as viewed
  const [markAllVideosAsViewed, { loading: markAllLoading }] = useMutation(
    MARK_ALL_VIDEOS_AS_VIEWED,
    {
      onCompleted: (data) => {
        if (data?.markVideoAsViewed?.success) {
          // Update user in Redux so blocking page disappears
          if (user) {
            dispatch(
              setUser({
                ...user,
                hasViewedAllVideos: true,
              })
            );
          }
        }
      },
      onError: (error) => {
        console.error("Failed to mark all videos as viewed:", error);
      },
    }
  );

  const accountStats = [
    {
      label: "Total Revenue",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboardData?.doctorDashboard?.totalSales),
      icon: (
        <RevenueIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-purple-500",
    },
    {
      label: "Net Profit",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboardData?.doctorDashboard?.totalProfit),
      icon: (
        <ProfitIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-emerald-400",
    },
    {
      label: "Total Orders",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboardData?.doctorDashboard?.averageOrderValue),
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
      value: dashboardLoading
        ? "..."
        : formatNumber(dashboardData?.doctorDashboard?.ordersCount),
      icon: (
        <PercentIcon
          height={isMobile ? "20" : "32"}
          width={isMobile ? "20" : "32"}
        />
      ),
      bgColor: "bg-orange-400",
    },
  ];

  // Handler for marking all videos as viewed
  const handleMarkAllAsViewed = () => {
    markAllVideosAsViewed({
      variables: {
        viewedAll: true,
      },
    });
  };

  // Show blocking page if doctor hasn't viewed all videos (except on training-videos page)
  if (shouldShowBlockingPage) {
    return (
      <DoctorRoute>
        <TrainingVideosBlockingPage
          onMarkAllAsViewed={handleMarkAllAsViewed}
          isLoading={markAllLoading}
        />
      </DoctorRoute>
    );
  }

  return (
    <DoctorRoute>
      <div className={`w-full min-h-screen xl:p-4 ${poppins_init.className}`}>
        <div className="px-2 py-3 md:p-4 md:pb-6 lg:mb-6 lg:pb-10 h-fit mb-2 md:mb-4 flex lg:p-5 flex-col gap-5 md:gap-10 relative  items-center justify-center bg-black/40  xl:rounded-[20px] !bg-[url(/images/bannerImage.png)] !bg-center w-full !bg-cover !bg-no-repeat ">
          <Header menuItems={menuItems} />

          {!hideStats && (
            <DashboardStats
              showUserName={pathname.startsWith("/orders") ? false : true}
              username={user?.fullName || "noname"}
              heading={heading}
              stats={hasMyClinic ? accountStats : stats}
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
    </DoctorRoute>
  );
}
