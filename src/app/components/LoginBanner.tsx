import React from "react";
import AttributionCard from "./ui/cards/AttributionCard";
import { StaticImageData } from "next/image";

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

const LoginBanner: React.FC<LoginBannerProps> = ({
  backgroundImage,
  image,
  alt,
  quote,
  author,
  stats = [],
}) => {
  return (
    <div className="w-full h-dvh py-2 pe-2 sm:py-2 sm:pe-2 md:py-3 md:pe-3 lg:py-6 lg:pe-6">
      <div
        className="flex items-center justify-center rounded-3xl w-full h-full bg-no-repeat bg-cover bg-center md:p-4  lg:p-8"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <AttributionCard
          image={image}
          alt={alt}
          quote={quote}
          author={author}
          stats={stats}
        />
      </div>
    </div>
  );
};

export default LoginBanner;
