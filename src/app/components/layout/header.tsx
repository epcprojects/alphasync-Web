"use client";
import React, { useEffect, useState, MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Images } from "@/app/ui/images";
import { ProfileIcon, LogoutIcon, RequestIcon } from "@/icons";
import HeaderMenuNavItems from "./HeaderMenuNavItems";
import Notifications from "../ui/Notifications";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { notifications } from "../../../../public/data/notifications";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import Cookies from "js-cookie";
import { clearUser } from "@/lib/store/slices/authSlice";
import { useRouter } from "next/navigation";

interface MenuItemType {
  label: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
}

interface HeaderProps {
  menuItems: MenuItemType[];
}

const Header: React.FC<HeaderProps> = ({ menuItems }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
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

  // useEffect(() => {
  //   const handleScroll = (): void => {
  //     setIsSticky(window.scrollY > 100);
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return (): void => window.removeEventListener("scroll", handleScroll);
  // }, []);

  useEffect(() => {
    const handleScroll = (): void => {
      const isStickyNow = window.scrollY > 350;
      setIsSticky(isStickyNow);
      const mainEl = document.querySelector("main");
      if (mainEl) {
        if (isStickyNow) {
          mainEl.classList.add("pt-20");
        } else {
          mainEl.classList.remove("pt-20");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hasPendingPayment = menuItems.some((item) =>
    item.href.includes("pending-payment")
  );

  const isAdminHeader = menuItems.some((item) =>
    item.label.includes("Doctors")
  );
  const user = useAppSelector((state) => state.auth.user);
  const INITIAL_AVATAR = "/images/arinaProfile.png";
  const handleLogout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("user_data");
    dispatch(clearUser());
    router.push("/login");
  };

  return (
    <>
      <header
        dir="ltr"
        className={`
    transition-all duration-500 ease-in-out 
    ${
      isSticky
        ? "fixed w-full md:w-[98%] pt-2.5 md:pt-4 px-2 md:px-4 md:rounded-2xl top-0 md:top-4 !bg-[url(/images/bannerImage.png)] !bg-top !bg-cover !bg-no-repeat"
        : "relative w-full border-b border-white/20 top-0"
    } 
    pb-2.5 md:pb-5 z-[99]`}
      >
        <nav className=" xl:px-4 flex items-center justify-between  mx-auto ">
          <div className="flex items-center gap-2 justify-start w-fit">
            <div className="flex xl:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center w-8 h-8 md:h-11 md:w-11  bg-black/40 rounded-full text-black"
                onClick={handleMenuButtonClick}
                aria-label="Open main menu"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.16724 3.66345C2.16724 3.38731 2.39109 3.16345 2.66724 3.16345H10.6672C10.9434 3.16345 11.1672 3.38731 11.1672 3.66345C11.1672 3.9396 10.9434 4.16345 10.6672 4.16345L2.66724 4.16345C2.39109 4.16345 2.16724 3.93959 2.16724 3.66345Z"
                    fill="white"
                  />
                  <path
                    d="M2.16724 8.33012C2.16724 8.05398 2.39109 7.83012 2.66724 7.83012L13.3339 7.83012C13.61 7.83012 13.8339 8.05398 13.8339 8.33012C13.8339 8.60626 13.61 8.83012 13.3339 8.83012L2.66724 8.83012C2.39109 8.83012 2.16724 8.60626 2.16724 8.33012Z"
                    fill="white"
                  />
                  <path
                    d="M2.66724 12.4968C2.39109 12.4968 2.16724 12.7206 2.16724 12.9968C2.16724 13.2729 2.39109 13.4968 2.66724 13.4968H8.00057C8.27671 13.4968 8.50057 13.2729 8.50057 12.9968C8.50057 12.7206 8.27671 12.4968 8.00057 12.4968H2.66724Z"
                    fill="white"
                  />
                </svg>
              </button>
            </div>

            <Link href="/" className="w-fit xl:flex hidden">
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
                className="h-8 w-fit md:hidden"
                src={Images.layout.logoWhite}
                priority={true}
                width={208}
                height={32}
              />
            </Link>
          </div>

          <div className="bg-black/40 xl:flex hidden backdrop-blur shadow-xl  md:rounded-full lx:px-3 md:p-2">
            <HeaderMenuNavItems items={menuItems} />
          </div>

          <div className="items-center  gap-2.5 flex ">
            {hasPendingPayment && (
              <Link
                href={"/customer-requests"}
                className="h-8 w-8 cursor-pointer md:w-11 md:h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
              >
                <RequestIcon fill="white" />
              </Link>
            )}

            {!isAdminHeader && <Notifications notifications={notifications} />}

            <div className="text-right w-8 h-8 md:h-11 md:w-11">
              <Menu>
                <MenuButton className="inline-flex cursor-pointer items-center gap-2 rounded-full  text-sm/6 font-semibold  shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-700 data-open:bg-gray-700">
                  <Image
                    width={40}
                    height={40}
                    src={
                      user?.imageUrl
                        ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${user?.imageUrl}`
                        : INITIAL_AVATAR
                    }
                    className="w-8 h-8 md:h-11 md:w-11 rounded-full"
                    alt="arina profile"
                  />
                </MenuButton>

                <MenuItems
                  transition
                  anchor="bottom end"
                  className={`min-w-44  z-[400] origin-top-right rounded-xl border border-white/5 ${
                    isSticky ? "md:bg-black/80" : " bg-gray-800"
                  } p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:--spacing(1)] focus:outline-none data-closed:scale-95 data-closed:opacity-0`}
                >
                  <div className="bg-black/45 mb-1 py-2 px-3 rounded-lg">
                    <span className="text-white whitespace-nowrap text-sm block">
                      {user?.fullName}
                    </span>
                    <span className="text-white/40 whitespace-nowrap ">
                      {user?.email}
                    </span>
                  </div>
                  <MenuItem>
                    <Link
                      href={hasPendingPayment ? "/profile" : "/settings"}
                      className="group flex cursor-pointer w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
                    >
                      <ProfileIcon /> Profile
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link
                      href={"/login"}
                      onClick={handleLogout}
                      className="group flex cursor-pointer w-full items-center gap-2 rounded-lg px-3 py-1.5 data-focus:bg-white/10"
                    >
                      <LogoutIcon /> Logout
                    </Link>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <div
          className={`xl:hidden ${isMenuOpen ? "block" : "hidden"}`}
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

          <div className="fixed inset-y-0 gap-4 flex flex-col left-0 z-20 min-w-xs p-4 px-4 overflow-y-auto bg-white md:px-6 md:py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between pt-1.5">
              <Link href="/" onClick={closeMenu}>
                <span className="sr-only">Your Company</span>
                <Image
                  alt="Company Logo"
                  className="h-12 w-fit"
                  src={Images.auth.logo}
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
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#A4A7AE"
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

            <div className="flow-root">
              <div className=" divide-y divide-gray-500/10">
                <div className=" border-b-0 flex flex-col gap-2.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        onClick={closeMenu}
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-1.5 p-1.5  text-base font-normal leading-7 text-gray-900 hover:bg-gray-100"
                      >
                        <span className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center">
                          <Icon fill={"currentColor"} height="16" width="16" />
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => {
                      closeMenu();
                      handleLogout();
                    }}
                    key={"logout"}
                    className="flex items-center gap-1.5 p-1.5 w-full text-left text-base font-normal leading-7 text-gray-900 hover:bg-gray-100"
                  >
                    <span className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center">
                      <LogoutIcon
                        fill={"currentColor"}
                        height="16"
                        width="16"
                      />
                    </span>
                    Logout
                  </button>
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
