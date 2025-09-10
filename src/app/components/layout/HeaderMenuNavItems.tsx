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
    <ul className="flex-row items-center justify-center flex-grow hidden gap-4 rtl:flex-row-reverse md:flex ">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`nav-link flex items-center gap-1 font-medium rtl:leading-10 whitespace-nowrap text-base  py-1.5 px-3 duration-300 hover:bg-primary/80 ${
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
                <Icon fill={isActive ? "#2862A9" : "#ffffff50"} />
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
