"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  categories: string[]; // e.g. ["AOD-9604", "Epithalon", ...]
  data: number[]; // e.g. [3900, 3600, ...]
  height?: number;
};

export default function HorizontalBarChart({
  categories,
  data,
  height = 320,
}: Props) {
  const series = [{ name: "Revenue", data }];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "58%", // thickness
        borderRadius: 8, // rounded ends
        borderRadiusApplication: "end", // round only the right side
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      strokeDashArray: 0, // dotted vertical grid lines like screenshot
      borderColor: "#E5E7EB",
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
          fontWeight: 500,
        },
        formatter: (val: string) => {
          const n = Number(val);
          if (Number.isNaN(n)) return val;
          return `$${Math.round(n / 1000)}k`;
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      min: 0,
    },
    yaxis: {
      labels: {
        style: {
          colors: "#374151",
          fontSize: "13px",
          fontWeight: 600,
        },
      },
    },

    // Create different blue shades per bar
    // (your screenshot shows a light-to-dark progression)
    colors: ["#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A"],

    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val: number) => `$${val.toLocaleString()}`,
      },
    },
  };

  return <Chart options={options} series={series} type="bar" height={height} />;
}
