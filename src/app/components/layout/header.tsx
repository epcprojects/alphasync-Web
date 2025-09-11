"use client";
import React, { useEffect, useState, MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Images } from "@/app/ui/images";
import {
  InventoryIcon,
  CustomerIcon,
  OrdersIcon,
  ReminderIcon,
  RequestIcon,
  SettingsIcon,
  ProfileIcon,
  LogoutIcon,
} from "@/icons";
import HeaderMenuNavItems from "./HeaderMenuNavItems";
import Notifications from "../ui/Notifications";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

// interface HeaderProps {0}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSticky, setIsSticky] = useState<boolean>(false);

  const toggleMenu = (): void => setIsMenuOpen((prev: boolean) => !prev);
  const closeMenu = (): void => setIsMenuOpen(false);

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    closeMenu();
  };

  const handleMenuButtonClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    toggleMenu();
  };

  const handleCloseButtonClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    closeMenu();
  };

  useEffect(() => {
    const handleScroll = (): void => {
      setIsSticky(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll);
    // return (): void => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Inventory", href: "/inventory", icon: InventoryIcon },
    { label: "Customers", href: "/customers", icon: CustomerIcon },
    { label: "Orders", href: "/orders", icon: OrdersIcon },
    {
      label: "Reminder",
      href: "/reminder",
      icon: ReminderIcon,
    },
    { label: "Requests", href: "/requests", icon: RequestIcon },
    { label: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  return (
    <>
      <header
        dir="ltr"
        className={`
    transition-all duration-500 ease-in-out 
    ${
      isSticky
        ? "fixed w-[98%] pt-4 px-4 rounded-2xl top-4 !bg-[url(/images/bannerImage.png)] !bg-top !bg-cover !bg-no-repeat"
        : "relative w-full border-b border-white/20 top-0"
    } 
    pb-2 md:pb-3.5 z-[99]`}
      >
        <nav className="px-2 md:px-4 flex items-center justify-between  mx-auto ">
          <div className="flex items-start justify-start ">
            <Link href="/" className="">
              <span className="sr-only">Your Company</span>
              <Image
                alt="Company Logo"
                className="hidden h-12 w-full md:block"
                src={Images.layout.logoWhite}
                priority={true}
                width={240}
                height={48}
              />

              <Image
                alt="Company Logo Mobile"
                className="h-8 w-52 md:hidden"
                src={Images.layout.logoWhite}
                priority={true}
                width={208}
                height={32}
              />
            </Link>
          </div>

          <div className="bg-black/40 backdrop-blur shadow-xl  md:rounded-full lg:px-3 p-2">
            <HeaderMenuNavItems items={menuItems} />
          </div>

          <div className="items-center hidden gap-4 md:flex">
            <Notifications />

            <div className="text-right w-8 h-8 md:h-11 md:w-11">
              <Menu>
                <MenuButton className="inline-flex items-center gap-2 rounded-full  text-sm/6 font-semibold  shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700">
                  <Image
                    width={40}
                    height={40}
                    src={"/images/arinaProfile.png"}
                    className="w-8 h-8 md:h-11 md:w-11 rounded-full"
                    alt="arina profile"
                  />
                </MenuButton>

                <MenuItems
                  transition
                  anchor="bottom end"
                  className={`min-w-44  z-[400] origin-top-right rounded-xl border border-white/5 ${
                    isSticky ? "bg-black/80" : "bg-black/30"
                  } p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
                >
                  <div className="bg-black/40 mb-1 py-2 px-3 rounded-lg">
                    <span className="text-white whitespace-nowrap text-sm block">
                      Arina Baker
                    </span>
                    <span className="text-white/40 whitespace-nowrap ">
                      arina@alphasync.com
                    </span>
                  </div>
                  <MenuItem>
                    <button className="group flex cursor-pointer w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                      <ProfileIcon /> Profile
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button className="group flex cursor-pointer w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10">
                      <LogoutIcon /> Logout
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-black"
              onClick={handleMenuButtonClick}
              aria-label="Open main menu"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                width="44"
                height="44"
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M11.5 14.125C11.5 13.5156 11.9688 13 12.625 13H31.375C31.9844 13 32.5 13.5156 32.5 14.125C32.5 14.7812 31.9844 15.25 31.375 15.25H12.625C11.9688 15.25 11.5 14.7812 11.5 14.125ZM11.5 21.625C11.5 21.0156 11.9688 20.5 12.625 20.5H25.375C25.9844 20.5 26.5 21.0156 26.5 21.625C26.5 22.2812 25.9844 22.75 25.375 22.75H12.625C11.9688 22.75 11.5 22.2812 11.5 21.625ZM20.5 29.125C20.5 29.7812 19.9844 30.25 19.375 30.25H12.625C11.9688 30.25 11.5 29.7812 11.5 29.125C11.5 28.5156 11.9688 28 12.625 28H19.375C19.9844 28 20.5 28.5156 20.5 29.125Z"
                  fill="black"
                />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div
          className={`lg:hidden ${isMenuOpen ? "block" : "hidden"}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div
            className={`fixed inset-0 z-10 bg-black opacity-50 ${
              isMenuOpen ? "block" : "hidden"
            }`}
            onClick={handleBackdropClick}
          ></div>

          <div className="fixed inset-y-0 right-0 z-20 w-full p-4 px-4 overflow-y-auto bg-white md:px-6 md:py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between pt-1.5">
              <Link href="/" onClick={closeMenu}>
                <span className="sr-only">Your Company</span>
                <Image
                  alt="Company Logo"
                  className="h-8 w-52"
                  src={Images.layout.logoWhite}
                  width={208}
                  height={32}
                />
              </Link>

              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={handleCloseButtonClick}
                aria-label="Close menu"
              >
                <span className="sr-only">Close menu</span>
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flow-root mt-6">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="px-4 py-6 border-b-0">
                  {menuItems.map((item) => {
                    return (
                      <Link
                        onClick={closeMenu}
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between px-3 py-3 -mx-3 text-base font-normal leading-7 text-cinder border-b-[1px] border-slate-200 hover:bg-gray-100"
                      >
                        {item.label}
                        <span>
                          <svg
                            width="9"
                            height="14"
                            viewBox="0 0 9 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              d="M7.86454 6.46875C8.14579 6.78125 8.14579 7.25 7.86454 7.53125L1.86454 13.5312C1.55204 13.8438 1.08329 13.8438 0.802042 13.5312C0.489542 13.25 0.489542 12.7812 0.802042 12.5L6.27079 7.03125L0.802042 1.53125C0.489542 1.25 0.489542 0.78125 0.802042 0.5C1.08329 0.1875 1.55204 0.1875 1.83329 0.5L7.86454 6.46875Z"
                              fill="black"
                            />
                          </svg>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
