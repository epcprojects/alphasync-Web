"use client";
import React from "react";

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string; // e.g. "bg-purple-500"
}

interface DashboardStatsProps {
  username: string;
  showUserName: boolean;
  heading: string;
  stats?: StatItem[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  username,
  showUserName,
  heading,
  stats,
}) => {
  return (
    <div className="flex items-center gap-3 md:gap-12 flex-col">
      {/* Header */}
      <div className="flex items-center flex-col gap-1.5 md:gap-3 justify-center">
        {showUserName && (
          <h2 className="text-white font-normal text-base md:text-2xl">
            👋 Welcome {username},
          </h2>
        )}

        <h3 className="text-white text-2xl font-semibold md:text-4xl">
          {heading}
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:max-w-7xl md:max-w-6xl w-full mx-auto md:grid-cols-4 gap-2.5 md:gap-5">
        {stats?.map((item, idx) => (
          <div
            key={idx}
            className="border flex items-center gap-2 md:gap-4 border-white/10 p-2 rounded-2xl bg-black/30 backdrop-blur-sm md:p-3"
          >
            <span
              className={`w-10 h-10 md:w-15 md:h-15 rounded-full flex items-center justify-center ${item.bgColor}`}
            >
              {item.icon}
            </span>

            <div>
              <span className="text-white/80 font-medium text-xs md:text-sm">
                {item.label}
              </span>
              <span className="text-lg md:text-2xl text-white font-semibold block">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
