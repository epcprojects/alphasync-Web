import React from "react";
import Image, { StaticImageData } from "next/image";
import { Images } from "../ui/images";

interface Stat {
  value: string;
  label: string;
}

interface LoginBannerProps {
  backgroundImage: string;
  image: StaticImageData | string;
  alt?: string;
  quote: string;
  author: string;
  stats?: Stat[];
}

const LoginBanner: React.FC<LoginBannerProps> = ({ backgroundImage }) => {
  return (
    <div className="w-full h-dvh py-2 pe-2 sm:py-2 sm:pe-2 md:py-3 md:pe-3 lg:py-6 lg:pe-6">
      <div
        className="flex items-center justify-center rounded-3xl w-full h-full bg-no-repeat bg-cover bg-center md:p-4  lg:p-8"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
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
                width={240}
                height={48}
                style={{ width: "auto" }}
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBanner;
