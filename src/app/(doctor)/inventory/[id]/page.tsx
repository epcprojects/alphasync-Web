"use client";
import { ProductSwiper, ThemeButton } from "@/app/components";
import OrderModal from "@/app/components/ui/modals/OrderModal";
import { ArrowDownIcon, HeartFilledIcon, ShopingCartIcon } from "@/icons";
import { showSuccessToast } from "@/lib/toast";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function PostDetail() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const params = useParams<{ id: string }>();
  const productViews = [
    {
      id: "condition-history",
      title: "Condition History",
      imagePath: "/images/products/p1.png",
      thumbnailPath: "/images/products/p1.png",
    },
    {
      id: "vital-signs",
      title: "Vital Signs",
      imagePath: "/images/products/p2.png",
      thumbnailPath: "/images/products/p2.png",
    },
    {
      id: "medication-history",
      title: "Medication History",
      imagePath: "/images/products/p3.png",
      thumbnailPath: "/images/products/p3.png",
    },
    {
      id: "appointment-history",
      title: "Appointment History",
      imagePath: "/images/products/p4.png",
      thumbnailPath: "/images/products/p4.png",
    },
    {
      id: "appointment",
      title: "Appointment History",
      imagePath: "/images/products/p5.png",
      thumbnailPath: "/images/products/p5.png",
    },
  ];

  const [price, setPrice] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleConfirmOrder = () => {
    console.log("log");
    setIsOrderModalOpen(false);
    showSuccessToast("Order created successfully!");
  };
  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-8 pt-2 mx-auto">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={router.back}
          className="flex rotate-90 cursor-pointer bg-white rounded-full shadow items-center justify-center w-7 h-7 md:h-10 md:w-10"
        >
          <ArrowDownIcon />
        </button>
        <h2 className="text-black font-semibold text-lg md:text-3xl">
          Back to Inventory
        </h2>
      </div>
      <div className="bg-white shadow p-4 md:p-6 rounded-2xl ">
        <div className="grid grid-cols-[410px_1fr] gap-4 md:gap-6">
          <div className="bg-white flex flex-col gap-4 h-fit shadow relative border border-gray-200 p-4 rounded-xl overflow-hidden">
            <button className="absolute top-4 end-4 z-10 cursor-pointer">
              {/* {product.isFavourite ? ( */}
              <HeartFilledIcon fill="#2862A9" />
              {/* ) : (
                <HeartOutlineIcon fill="#374151" />
              )} */}
            </button>
            <ProductSwiper productViews={productViews} />

            <div className="bg-gray-50 flex items-center justify-between gap-2 backdrop-blur-sm border py-1 md:py-2 px-2 md:px-3 rounded-xl border-gray-100">
              <span className="block w-fit rounded-full bg-gray-100 border border-gray-200 py-0.5 px-2.5 text-gray-700 font-medium text-xs md:text-sm">
                Healing Peptide
              </span>

              <span className="block text-primary text-xs md:text-sm font-semibold">
                Stock: 45
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 md:gap-5">
            <div>
              <h2 className="text-gray-900 font-semibold text-xl md:text-3xl">
                2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)
              </h2>

              <span className="text-primary font-semibold text-sm md:text-lg ">
                $89.99
              </span>
            </div>

            <div>
              <label
                htmlFor="input-group-1"
                className="block mb-1 text-sm font-normal text-gray-600"
              >
                Price to Customer ($)
              </label>
              <div className="relative flex items-center w-fit">
                <div className="absolute inset-y-0 text-gray-400 start-0 text-sm flex items-center ps-3.5 pointer-events-none">
                  $
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={price}
                  maxLength={8}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`border border-gray-200  outline-none bg-white text-gray-900 text-sm rounded-lg focus:ring-gray-200 focus:ring-1 block w-full ps-8 p-1.5 max-w-44`}
                  placeholder=""
                />
                <button className="rounded-md py-1.5 cursor-pointer hover:bg-gray-300 px-3 absolute bg-porcelan text-xs  end-1">
                  Save
                </button>
              </div>
              {/* {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )} */}
            </div>

            <div className="">
              <h2 className="text-black font-medium text-sm md:text-base ">
                Product Information
              </h2>

              <p className="text-gray-800 text-xs font-normal">
                Body Protection Compound for tissue repair and gut health.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-4">
              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-xs !font-normal">
                  Manufacturer
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  PeptideLabs
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-xs !font-normal">
                  Dosage
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  5mg vial
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-xs !font-normal">
                  Active Ingredient
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  BPC-157 Acetate
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-1 md:p-2.5 flex flex-col gap-1">
                <span className="block text-gray-800 text-xs !font-normal">
                  Category
                </span>
                <span className="text-gray-800 block font-xs md:text-sm font-medium">
                  Healing Peptides
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 md:gap-4">
              <div>
                <h2 className="text-xs md:text-sm text-gray-600 font-normal">
                  Current Stock:{" "}
                  <span className="text-primary font-semibold">45</span>
                </h2>
              </div>

              <ThemeButton
                label="Order"
                icon={<ShopingCartIcon fill="white" height={20} width={20} />}
                onClick={() => setIsOrderModalOpen(true)}
                className="w-fit min-w-40"
                size="small"
              />
            </div>

            <div className="bg-gray-50 rounded-xl">
              <div className="p-2 md:p-4">
                <h2 className="text-black font-medium text-sm md:text-base">
                  Details:
                </h2>
              </div>
              <div className="p-2 md:p-4 pt-0 md:pt-0">
                <ul className="list-disc list-inside text-xs md:text-sm text-gray-800 flex flex-col gap-1 md:gap-2">
                  <li>
                    A 1:1 blend of CJC-1295 No DAC (5mg) and Ipamorelin (5mg)
                    designed to optimize growth hormone (GH) release, promoting
                    muscle growth, fat loss, and enhanced tissue repair.
                  </li>
                  <li>
                    CJC-1295 No DAC stimulates natural GH pulses with extended
                    activity, mimicking physiological GH release patterns for
                    balanced and sustained anabolic effects.
                  </li>
                  <li>
                    Ipamorelin selectively triggers potent GH release via the
                    ghrelin receptor, minimizing side effects on cortisol and
                    prolactin levels for a cleaner hormonal profile.
                  </li>
                  <li>
                    This synergistic combination enhances lean muscle mass,
                    improves recovery, boosts fat metabolism, and supports
                    anti-aging benefits through increased collagen production.
                  </li>
                  <li>
                    Ideal for advanced users looking to achieve optimized
                    anabolic responses, faster recovery, and improved body
                    composition without disrupting hormonal balance.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <OrderModal
        isOpen={isOrderModalOpen}
        onConfirm={() => handleConfirmOrder()}
        customers={[
          {
            name: "John Smith",
            displayName: "John Smith",
            email: "john.smith@email.com john.smith@email.com",
          },
          {
            name: "Sarah J",
            displayName: "Sarah J",
            email: "john.smith@email.com",
          },
          {
            name: "Emily Chen",
            displayName: "Emily Chen",
            email: "john.smith@email.com",
          },
        ]}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </div>
  );
}
