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
    <div className="w-full h-dvh py-6 pe-6">
      <div
        className="flex items-center justify-center rounded-3xl w-full h-full bg-no-repeat bg-cover bg-center p-5 md:p-8"
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
