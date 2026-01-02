"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type ChartSeries = {
  name: string;
  data: number[];
};

type Props = {
  categories: string[];
  series: ChartSeries[];
  height?: number;
  colors?: string[];
  yPrefix?: string;
  ySuffix?: string;
};

export default function RevenueChart({
  categories,
  series,
  height = 320,
  colors = ["#2862A9", "#16A34A"],
  yPrefix = "$",
  ySuffix = "k",
}: Props) {
  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.4,
        opacityFrom: 0.3,
        opacityTo: 0,
      },
    },
    grid: {
      strokeDashArray: 0,
      borderColor: "#E5E7EB",
    },
    colors,
    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#374151",
          fontSize: "12px",
          fontWeight: 400,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#374151",
          fontSize: "12px",
          fontWeight: 400,
        },
        formatter: (val: number) => {
          const k = val / 1000;
          const rounded = Number.isInteger(k) ? k : Math.round(k * 10) / 10;
          return `${yPrefix}${rounded}${ySuffix}`;
        },
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    tooltip: { shared: true, intersect: false },
  };

  return (
    <Chart options={options} series={series} type="area" height={height} />
  );
}
