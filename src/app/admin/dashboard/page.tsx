"use client";

import React, { Suspense, useState } from "react";
import { Loader } from "@/app/components";
import { useQuery } from "@apollo/client";
import {
  ADMIN_DASHBOARD,
  ORDERS_GRAPH,
  REVENUE_GRAPH,
} from "@/lib/graphql/queries";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  DashDoctor,
  PackageIcon,
  OrdersIcon,
  InventoryIcon,
  CustomerIcon,
  ArrowDownIcon,
} from "@/icons";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface TopSellingProduct {
  productId: string;
  productTitle: string;
  salesCount: number;
  salesPercentage: number;
}

interface TopPerformingDoctor {
  doctorName: string;
  totalSalesAmount: number;
  doctorEmail: string;
}

interface NewlyOnboardedDoctor {
  doctorEmail: string;
  doctorId: string;
  doctorName: string;
  onboardedAt: string;
}

interface OrdersGraphDataPoint {
  date: string;
  label: string;
  ordersCount: number;
}

interface OrdersGraphResponse {
  ordersGraph: {
    period: string;
    totalOrders: number;
    dataPoints: OrdersGraphDataPoint[];
  };
}

interface RevenueGraphDataPoint {
  date: string;
  label: string;
  revenueAmount: number;
}

interface RevenueGraphResponse {
  revenueGraph: {
    period: string;
    totalRevenue: number;
    dataPoints: RevenueGraphDataPoint[];
  };
}

interface AdminDashboardResponse {
  adminDashboard: {
    totalProductsSold: number;
    totalDoctors: number;
    salesAmountToday: number;
    salesAmountThisMonth: number;
    salesAmountPastMonth: number;
    newDoctorsThisMonth: number;
    inactiveDoctors: number;
    activeDoctors: number;
    topSellingProducts: TopSellingProduct[];
    topPerformingDoctors: TopPerformingDoctor[];
    newlyOnboardedDoctors: NewlyOnboardedDoctor[];
  };
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatNumber = (value?: number | null) =>
  value === null || value === undefined ? "--" : numberFormatter.format(value);

const formatCurrency = (value?: number | null) =>
  value === null || value === undefined
    ? "--"
    : currencyFormatter.format(value || 0);

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "--";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "--";
  }
};

function DashboardContent() {
  const isMobile = useIsMobile();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("yearly");
  const [selectedRevenuePeriod, setSelectedRevenuePeriod] =
    useState<string>("yearly");

  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useQuery<AdminDashboardResponse>(ADMIN_DASHBOARD, {
    fetchPolicy: "network-only",
  });

  const {
    data: ordersGraphData,
    loading: ordersGraphLoading,
    error: ordersGraphError,
  } = useQuery<OrdersGraphResponse>(ORDERS_GRAPH, {
    variables: { period: selectedPeriod },
    fetchPolicy: "network-only",
  });

  const {
    data: revenueGraphData,
    loading: revenueGraphLoading,
    error: revenueGraphError,
  } = useQuery<RevenueGraphResponse>(REVENUE_GRAPH, {
    variables: { period: selectedRevenuePeriod },
    fetchPolicy: "network-only",
  });

  const periodOptions = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const selectedPeriodLabel =
    periodOptions.find((opt) => opt.value === selectedPeriod)?.label ||
    "Monthly";

  if (dashboardError) {
    console.error("Failed to load admin dashboard:", dashboardError);
  }

  if (ordersGraphError) {
    console.error("Failed to load orders graph:", ordersGraphError);
  }

  if (revenueGraphError) {
    console.error("Failed to load revenue graph:", revenueGraphError);
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
    {
      label: "Total Products Sold",
      value: dashboardLoading
        ? "..."
        : formatNumber(dashboardData?.adminDashboard?.totalProductsSold),
      icon: (
        <PackageIcon
          fill="#fff"
          height={isMobile ? 16 : 32}
          width={isMobile ? 16 : 32}
        />
      ),
      bgColor: "bg-blue-500",
    },
    {
      label: "Sales Today",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboardData?.adminDashboard?.salesAmountToday),
      icon: (
        <OrdersIcon
          fill="#fff"
          height={isMobile ? "16" : "32"}
          width={isMobile ? "16" : "32"}
        />
      ),
      bgColor: "bg-green-500",
    },
    {
      label: "Sales This Month",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboardData?.adminDashboard?.salesAmountThisMonth),
      icon: (
        <InventoryIcon
          fill="#fff"
          height={isMobile ? "16" : "32"}
          width={isMobile ? "16" : "32"}
        />
      ),
      bgColor: "bg-indigo-500",
    },
    {
      label: "Sales Past Month",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboardData?.adminDashboard?.salesAmountPastMonth),
      icon: (
        <CustomerIcon
          fill="#fff"
          height={isMobile ? "16" : "32"}
          width={isMobile ? "16" : "32"}
        />
      ),
      bgColor: "bg-teal-500",
    },
  ];

  // Prepare data for gauge chart
  const topProducts = dashboardData?.adminDashboard?.topSellingProducts || [];
  const totalSales = topProducts.reduce(
    (sum, product) => sum + product.salesCount,
    0
  );

  const chartData = topProducts.map((product) => ({
    name: product.productTitle,
    value: product.salesCount,
    percentage: product.salesPercentage,
  }));

  // Colors for the chart segments (blue shades matching reference)
  const COLORS = ["#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"];

  // Custom label function - hide labels on chart, we'll show them in the list
  const renderCustomLabel = () => {
    return null;
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex items-center gap-2 md:gap-4">
        <h2 className="text-black font-semibold text-lg md:text-3xl">
          Dashboard Overview
        </h2>
      </div>

      {/* 8 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-table p-4 md:p-6 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.bgColor} p-2 md:p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm md:text-base font-medium">
                {stat.label}
              </p>
              <p className="text-black text-xl md:text-3xl font-bold mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row - 12 columns grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left 6 columns - Orders Graph */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-table p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-black font-semibold text-lg md:text-xl">
              Orders Overview
            </h3>
            <Menu as="div" className="relative">
              <MenuButton className="inline-flex items-center gap-2 py-2 px-3 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300">
                {selectedPeriodLabel}
                <ArrowDownIcon fill="#717680" />
              </MenuButton>
              <MenuItems
                transition
                anchor="bottom end"
                className="min-w-32 z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
              >
                {periodOptions.map((option) => (
                  <MenuItem key={option.value}>
                    <button
                      onClick={() => setSelectedPeriod(option.value)}
                      className={`flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full ${
                        selectedPeriod === option.value
                          ? "bg-gray-100 font-semibold"
                          : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>
          {ordersGraphLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          ) : ordersGraphData?.ordersGraph?.dataPoints &&
            ordersGraphData.ordersGraph.dataPoints.length > 0 ? (
            <div className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={ordersGraphData.ordersGraph.dataPoints}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    stroke="#666"
                    fontSize={12}
                    tick={{ fill: "#666" }}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    tick={{ fill: "#666" }}
                    tickFormatter={(value) => {
                      const num = Number(value);
                      return Number.isInteger(num) ? num.toString() : "";
                    }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => {
                      const num = Number(value);
                      return Number.isInteger(num)
                        ? num.toString()
                        : Math.round(num).toString();
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ordersCount"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {/* Stats at bottom */}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-xs md:text-sm">Period</p>
                  <p className="text-black font-semibold text-sm md:text-base capitalize">
                    {ordersGraphData.ordersGraph.period}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-xs md:text-sm">
                    Total Orders
                  </p>
                  <p className="text-black font-semibold text-sm md:text-base">
                    {formatNumber(ordersGraphData.ordersGraph.totalOrders)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No orders graph data available</p>
            </div>
          )}
        </div>

        {/* Right 6 columns - Top Selling Products Gauge Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-table p-4 md:p-6">
          <h3 className="text-black font-semibold text-lg md:text-xl mb-6">
            Top Selling Product
          </h3>

          {dashboardLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          ) : topProducts.length > 0 ? (
            <div className="flex flex-col gap-6 items-center">
              {/* Gauge Chart */}
              <div className="w-full flex flex-col items-center relative">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="90%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={85}
                      outerRadius={160}
                      paddingAngle={0}
                      dataKey="value"
                      label={renderCustomLabel}
                      stroke="none"
                      strokeWidth={0}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="none"
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Total text inside the inner circle */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
                  <p className="text-gray-500 text-sm md:text-base font-medium mb-1">
                    Total
                  </p>
                  <p className="text-black text-2xl font-bold">
                    {formatNumber(totalSales)}
                  </p>
                </div>
              </div>

              {/* Product List - Below the chart */}
              {topProducts.length > 0 && (
                <div className="w-full flex flex-col gap-3">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 transition-colors "
                    >
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-black text-sm md:text-base truncate">
                            {product.productTitle}
                          </p>
                          <p className="text-gray-600 font-medium text-sm md:text-base whitespace-nowrap">
                            {formatNumber(product.salesCount)}
                          </p>
                        </div>
                        <p className="text-gray-500 text-xs md:text-sm mt-1">
                          {product.salesPercentage.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">
                No top selling products data available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Graph Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-12 bg-white rounded-xl shadow-table p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-black font-semibold text-lg md:text-xl">
              Revenue Overview
            </h3>
            <Menu as="div" className="relative">
              <MenuButton className="inline-flex items-center gap-2 py-2 px-3 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300">
                {periodOptions.find(
                  (opt) => opt.value === selectedRevenuePeriod
                )?.label || "Yearly"}
                <ArrowDownIcon fill="#717680" />
              </MenuButton>
              <MenuItems
                transition
                anchor="bottom end"
                className="min-w-32 z-[400] origin-top-right rounded-lg border bg-white shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0"
              >
                {periodOptions.map((option) => (
                  <MenuItem key={option.value}>
                    <button
                      onClick={() => setSelectedRevenuePeriod(option.value)}
                      className={`flex items-center cursor-pointer gap-2 rounded-md text-gray-500 text-xs md:text-sm py-2 px-2.5 hover:bg-gray-100 w-full ${
                        selectedRevenuePeriod === option.value
                          ? "bg-gray-100 font-semibold"
                          : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>
          {revenueGraphLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          ) : revenueGraphData?.revenueGraph?.dataPoints &&
            revenueGraphData.revenueGraph.dataPoints.length > 0 ? (
            <div className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={revenueGraphData.revenueGraph.dataPoints}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    stroke="#666"
                    fontSize={12}
                    tick={{ fill: "#666" }}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    tick={{ fill: "#666" }}
                    tickFormatter={(value) => {
                      return formatCurrency(value);
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => {
                      return formatCurrency(value);
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenueAmount"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {/* Stats at bottom */}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-xs md:text-sm">Period</p>
                  <p className="text-black font-semibold text-sm md:text-base capitalize">
                    {revenueGraphData.revenueGraph.period}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-xs md:text-sm">
                    Total Revenue
                  </p>
                  <p className="text-black font-semibold text-sm md:text-base">
                    {formatCurrency(revenueGraphData.revenueGraph.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No revenue graph data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Doctors and Newly Onboarded Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Performing Doctors Card */}
        <div className="bg-white rounded-xl shadow-table p-4 md:p-6">
          <h3 className="text-black font-semibold text-lg md:text-xl mb-6">
            Top Performing Doctors
          </h3>
          {dashboardLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : dashboardData?.adminDashboard?.topPerformingDoctors &&
            dashboardData.adminDashboard.topPerformingDoctors.length > 0 ? (
            <div className="flex flex-col gap-3">
              {dashboardData.adminDashboard.topPerformingDoctors.map(
                (doctor, index) => (
                  <div
                    key={doctor.doctorEmail}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center rounded-full bg-purple-500 text-white font-semibold text-sm w-8 h-8 shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-black font-semibold text-sm md:text-base truncate">
                          {doctor.doctorName}
                        </p>
                        <p className="text-gray-500 text-xs md:text-sm truncate">
                          {doctor.doctorEmail}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 font-medium text-sm md:text-base whitespace-nowrap">
                      {formatCurrency(doctor.totalSalesAmount)}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">
                No top performing doctors data available
              </p>
            </div>
          )}
        </div>

        {/* Newly Onboarded Doctors Card */}
        <div className="bg-white rounded-xl shadow-table p-4 md:p-6">
          <h3 className="text-black font-semibold text-lg md:text-xl mb-6">
            Newly Onboarded Doctors
          </h3>
          {dashboardLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : dashboardData?.adminDashboard?.newlyOnboardedDoctors &&
            dashboardData.adminDashboard.newlyOnboardedDoctors.length > 0 ? (
            <div className="flex flex-col gap-3">
              {dashboardData.adminDashboard.newlyOnboardedDoctors.map(
                (doctor, index) => (
                  <div
                    key={doctor.doctorId}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center rounded-full bg-emerald-500 text-white font-semibold text-sm w-8 h-8 shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-black font-semibold text-sm md:text-base truncate">
                          {doctor.doctorName}
                        </p>
                        <p className="text-gray-500 text-xs md:text-sm truncate">
                          {doctor.doctorEmail}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs md:text-sm whitespace-nowrap">
                      {formatDate(doctor.onboardedAt)}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">
                No newly onboarded doctors data available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <DashboardContent />
    </Suspense>
  );
}
