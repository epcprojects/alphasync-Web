"use client";
import React, { ReactNode } from "react";
import { LoginBanner } from "../components";
import { Images } from "../ui/images";
import Image from "next/image";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full h-screen bg-white">
      <div className="grid xs:grid-cols-1 md:grid-cols-2 md:gap-4 sm:ps-4 xs:px-8">
        {children}
        <div className="hidden md:block">
          <div className="w-full h-dvh py-2 pe-2 sm:py-2 sm:pe-2 md:py-3 md:pe-3 lg:py-6 lg:pe-6">
            <div
              className="flex items-center justify-center rounded-3xl w-full h-full bg-no-repeat bg-cover bg-center md:p-4  lg:p-8"
              style={{ backgroundImage: `url(/images/loginBanner.png)` }}
            >
              <div className="p-5 sm:p-8 xl:min-w-[384px] min-w-48 min-h-48 xl:min-h-[324px] flex items-center justify-center rounded-4xl bg-black/30 border border-white/30 backdrop-blur">
                <Image
                  alt=""
                  src={Images.layout.logoWhite}
                  className="h-16 md:h-18  xl:h-24 w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
