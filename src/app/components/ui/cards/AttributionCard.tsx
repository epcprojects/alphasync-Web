import React from "react";
import Image, { StaticImageData } from "next/image";

interface Stat {
  value: string;
  label: string;
}

interface AttributionCardProps {
  image: StaticImageData | string;
  alt?: string;
  quote: string;
  author: string;
  stats?: Stat[];
}

const AttributionCard: React.FC<AttributionCardProps> = ({
  image,
  alt = "Profile picture",
  quote,
  author,
  stats = [],
}) => {
  return (
    <div className="rounded-2xl md:p-4 flex flex-col gap-4 md:gap-8  lg:p-6 xl:p-8 backdrop-blur-sm bg-black/25">
      {/* Top section: Image + Quote + Author */}
      <div className="flex items-start sm:gap-2 md:gap-4 lg:gap-8">
        <Image
          src={image}
          alt={alt}
          className="rounded-full border-3 shadow-lg border-white"
          unoptimized
        />

        <div className="flex flex-col gap-2 md:gap-4">
          <h2 className="text-white text-xl lg:text-2xl font-semibold">
            “{quote}”
          </h2>
          <h3 className="font-medium text-white text-sm lg:text-base">
            {author}
          </h3>
        </div>
      </div>

      {/* Stats Section */}
      {stats.length > 0 && (
        <div className="flex lg:flex-row flex-col items-start gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-black/15 backdrop-blur-md rounded-3xl px-3 py-2 md:px-5 md:py-3.5 w-full"
            >
              <h2 className="font-semibold text-center text-white text-lg md:text-2xl">
                {stat.value}
              </h2>
              <h3 className="text-xs md:text-sm whitespace-nowrap text-center text-white font-normal">
                {stat.label}
              </h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttributionCard;
