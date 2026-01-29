"use client";

import React, { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { ShoppingCartIcon } from "@/icons";
import ThemeButton from "./buttons/ThemeButton";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  imageSrc: string;
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function CartPopover() {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
      price: 68,
      qty: 1,
      imageSrc:
        "https://cdn.shopify.com/s/files/1/0904/1811/8965/files/ABM-SC-DIHEX-10x30_03345989-23ee-4fa3-9b74-ada8af232649.webp?v=1759262951",
    },
    {
      id: "2",
      name: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
      price: 68,
      qty: 1,
      imageSrc:
        "https://cdn.shopify.com/s/files/1/0904/1811/8965/files/ABM-SC-DIHEX-10x30_03345989-23ee-4fa3-9b74-ada8af232649.webp?v=1759262951",
    },
  ]);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items],
  );

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          {/* Button */}
          <PopoverButton
            aria-label="Open cart"
            className={
              "h-8 w-8 cursor-pointer md:w-11 md:h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center relative"
            }
          >
            <ShoppingCartIcon fill="white" />
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex lg:h-5 h-3.5 w-3.5 lg:min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] lg:text-xs font-semibold text-white">
                {count}
              </span>
            ) : null}
          </PopoverButton>

          {/* Panel */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-2 scale-[0.98]"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-120"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-2 scale-[0.98]"
          >
            <PopoverPanel
              anchor="bottom end"
              className="z-50 mt-3 w-95 rounded-xl border absolute right-0 top-12 border-gray-200 bg-white shadow-xl ring-1 ring-black/5 focus:outline-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-b-gray-100 p-4">
                <p className="text-base font-semibold text-gray-900">My Cart</p>
                <p className="text-xl font-semibold text-primary">
                  {formatMoney(total)}
                </p>
              </div>

              {/* Items */}
              <div className="overflow-auto p-5">
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-600">
                      Your cart is empty.
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start border-b pb-4 last:pb-0 border-b-gray-200 last:border-b-0 gap-4"
                      >
                        <div className="space-x-5 flex">
                          <div className="relative h-17.5 w-17.5 shrink-0 overflow-hidden">
                            <Image
                              src={item.imageSrc}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="70px"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-2.5">
                            <p className="text-sm font-normal leading-snug text-gray-900 line-clamp-2">
                              {item.name}
                            </p>

                            <div className="flex items-center justify-between">
                              <h2 className="text-gray-700 font-medium text-sm">
                                Quantity: {item.qty}
                              </h2>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-sm font-medium text-red-500 cursor-pointer hover:underline underline-offset-2 hover:text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-semibold text-gray-900 leading-snug">
                            {formatMoney(item.price * item.qty)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer button */}
              <div className="px-5 pb-5">
                <ThemeButton
                  type="button"
                  label="Continue"
                  onClick={() => {
                    close();
                  }}
                />
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
