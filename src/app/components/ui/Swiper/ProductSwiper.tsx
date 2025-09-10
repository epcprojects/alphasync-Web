"use client";
import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";

// Define a type for product views
interface ProductView {
  id: string;
  title: string;
  imagePath?: string;
  thumbnailPath?: string;
  component?: React.ReactNode;
}

interface ProductSwiperProps {
  productViews?: ProductView[];
}

const ProductSwiper: React.FC<ProductSwiperProps> = ({ productViews = [] }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const defaultViews: ProductView[] = [
    {
      id: "condition-history",
      title: "Condition History",
      imagePath: "/images/products/p1.png",
      thumbnailPath: "/images/products/p1.png",
    },
  ];

  const views = productViews.length > 0 ? productViews : defaultViews;

  return (
    <div className="w-full select-none medical-dashboard-container">
      <div className="mb-4 main-swiper-container">
        <Swiper
          modules={[Navigation, Pagination, Thumbs]}
          navigation
          pagination={false}
          thumbs={{ swiper: thumbsSwiper }}
          loop={false}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {views.map((view) => (
            <SwiperSlide key={view.id} className="bg-white cursor-pointer">
              <div className="relative grid grid-cols-12">
                {view.imagePath ? (
                  <div className="col-span-8 col-start-3 p-4 bg-[url(/images/productBgPattern.png)] !bg-bottom bg-contain flex items-center justify-center ">
                    <div className="w-full h-full">
                      <Image
                        className="!relative w-full h-full"
                        src={view.imagePath}
                        alt={view.title}
                        width={1080}
                        height={1080}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    {view.component ?? (
                      <p className="text-lg text-gray-500">
                        {view.title} Content
                      </p>
                    )}
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="hidden max-w-5xl mx-auto md:block thumbnail-swiper-container">
        <Swiper
          onSwiper={setThumbsSwiper}
          modules={[Thumbs]}
          watchSlidesProgress
          slidesPerView={3}
          spaceBetween={10}
          className={`${
            views.length > 3 && "start"
          } thumbnail-swiper centerThumbNails productSwiper`}
        >
          {views.map((view, index) => (
            <SwiperSlide
              key={`thumb-${view.id}`}
              className="flex items-center !w-fit gap-4 justify-center grid-cols-12 !mr-0 cursor-pointer"
            >
              <div
                className={`!shadow-none w-20 border h-20 ${
                  activeIndex === index
                    ? "border-primary   overflow-hidden"
                    : "bg-gray-100  border-gray-200"
                } rounded-md overflow-hidden p-2 transition-all duration-300`}
              >
                {view.thumbnailPath || view.imagePath ? (
                  <div className="w-full h-full">
                    <Image
                      src={view.thumbnailPath || view.imagePath || ""}
                      alt={`${view.title} thumbnail`}
                      width={400}
                      height={400}
                      className={`${
                        activeIndex !== index && "opacity-50"
                      } !relative h-full  w-full`}
                    />
                  </div>
                ) : (
                  <div
                    className={`w-full aspect-[4/3] flex items-center justify-center ${
                      activeIndex === index ? "bg-red-50" : "bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        activeIndex === index
                          ? "text-red-600 font-medium"
                          : "text-gray-600"
                      } text-center`}
                    >
                      {view.title}
                    </p>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductSwiper;
