"use client";
import React, { ReactNode } from "react";
import { LoginBanner } from "../components";
import { Images } from "../ui/images";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full h-screen bg-white">
      <div className="grid xs:grid-cols-1 md:grid-cols-2 md:gap-4 ">
        {children}
        <LoginBanner
          backgroundImage="/images/loginBanner.png"
          image={Images.auth.reviewImage1}
          alt="Trevor Kruder profile"
          quote="My core belief is to increase patient access to quality, affordable, peptides."
          author="Trevor Kruder | Founder, CEO & Chairman"
          stats={[
            { value: "40+", label: "Peptide Formulas" },
            { value: "100+", label: "Partners" },
            { value: "1M+", label: "Vials Produced" },
          ]}
        />
      </div>
    </div>
  );
}
