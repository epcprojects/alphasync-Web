import React, { ReactNode } from "react";
import { DashboardStats, Header } from "../components";
import { SyrupIcon } from "@/icons";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full min-h-screen p-4">
      <div className="p-4 pb-6 h-fit mb-2 md:mb-4 flex flex-col gap-6 md:gap-10 relative bg-black/40  rounded-2xl !bg-[url(/images/bannerImage.png)] !bg-center w-full !bg-cover !bg-no-repeat ">
        <Header />
        <DashboardStats
          username={"Arina"}
          heading="Trusted Peptide Solutions"
          stats={[
            {
              label: "Sales This Year",
              value: `${"$67,890.41"}`,
              icon: <SyrupIcon />,
              bgColor: "bg-purple-500",
            },
            {
              label: "Sales This Month",
              value: `${"$8,932.12"}`,
              icon: <SyrupIcon />,
              bgColor: "bg-emerald-500",
            },
            {
              label: "Sales This Week",
              value: `${"$2,114.77"}`,
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
      </div>
      {children}
    </div>
  );
}
