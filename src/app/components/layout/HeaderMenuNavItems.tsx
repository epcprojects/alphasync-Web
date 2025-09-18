"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ fill?: string }>;
}

interface HeaderMenuNavItemsProps {
  items: MenuItem[];
}

function HeaderMenuNavItems({ items }: HeaderMenuNavItemsProps) {
  const pathname = usePathname();

  return (
    <ul className="flex-row items-center justify-center flex-grow hidden lg:gap-4 rtl:flex-row-reverse md:flex ">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`nav-link group  flex items-center gap-1 font-light rtl:leading-10 whitespace-nowrap text-base  py-1.5 lg:px-3 duration-300 hover:bg-primary/80 ${
                isActive && "bg-primary"
              } rounded-full text-white`}
              style={{ cursor: "pointer" }}
            >
              <span
                className={` rounded-full w-8 h-8 flex items-center justify-center ${
                  isActive
                    ? "text-primary bg-white"
                    : " text-white bg-white/20 backdrop-blur"
                }`}
              >
                {/* <Icon fill={isActive ? "#2862A9" : "#ffffff50"} /> */}
                <span
                  className={`transition-colors duration-300  ${
                    isActive
                      ? "!text-[#2862A9]"
                      : "text-white/50 group-hover:!text-white"
                  }`}
                >
                  <Icon fill={"currentColor"} />
                </span>
              </span>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default HeaderMenuNavItems;
