"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { MoreIcon } from "@/icons";

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

  const moreItems = items.slice(5);
  const isMoreActive = moreItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <div className="flex items-center gap-4">
      <ul className="flex-row items-center justify-center flex-grow hidden lg:gap-1 xl:gap-2 rtl:flex-row-reverse md:flex ">
        {items.slice(0, 5).map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-link group  flex items-center gap-1 xl:gap-1.5 font-normal rtl:leading-10 whitespace-nowrap text-lg  py-[5px] lg:p-2 lg:pe-3 2xl:pe-5 duration-300 hover:bg-primary/80 ${
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
      {moreItems.length > 1 && (
        <div className="z-[100] flex ">
          <Menu>
            <MenuButton
              className={`nav-link group outline-none flex items-center gap-1 xl:gap-1.5 font-normal rtl:leading-10 whitespace-nowrap text-lg py-[5px] lg:p-2 lg:pe-5 duration-300 rounded-full text-white
    ${isMoreActive ? "bg-primary" : "hover:bg-primary/80"}
  `}
            >
              <span
                className={`rounded-full w-8 h-8 flex items-center justify-center ${
                  isMoreActive
                    ? "text-primary bg-white"
                    : "text-white bg-white/20 backdrop-blur"
                }`}
              >
                <span
                  className={`transition-colors duration-300 ${
                    isMoreActive
                      ? "!text-[#2862A9]"
                      : "text-white/50 group-hover:!text-white"
                  }`}
                >
                  <MoreIcon fill={"currentColor"} />
                </span>
              </span>
              More
            </MenuButton>

            <MenuItems
              transition
              className={`min-w-44 border p-1 text-sm/6 origin-top-right border-white/5 rounded-xl  top-16 right-0  backdrop-blur-3xl  ${true ? "md:bg-gray-900" : " bg-gray-800"} absolute text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
            >
              {items.slice(5).map((item, index) => {
                const Icon = item.icon;

                return (
                  <MenuItem key={index}>
                    <Link
                      href={item.href}
                      className="group flex cursor-pointer w-full items-center gap-1.5 text-sm rounded-lg px-3 py-2.5 data-focus:bg-primary"
                    >
                      <Icon fill={"currentColor"} />
                      {item.label}
                    </Link>
                  </MenuItem>
                );
              })}
            </MenuItems>
          </Menu>
        </div>
      )}
    </div>
  );
}

export default HeaderMenuNavItems;
