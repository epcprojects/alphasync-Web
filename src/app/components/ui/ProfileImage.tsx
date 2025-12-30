"use client";

import Image from "next/image";
import { useState } from "react";
import { getInitials } from "@/lib/helpers";

interface ProfileImageProps {
  imageUrl?: string | null;
  fullName?: string | null;
  email?: string | null;
  bg?: string;
  text?: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackClassName?: string;
}

export default function ProfileImage({
  imageUrl,
  fullName,
  email,
  bg = "bg-gray-100",
  text = "text-gray-600",
  width = 40,
  height = 40,
  className = "rounded-full object-cover bg-gray-200",
  fallbackClassName,
}: ProfileImageProps) {
  const [imageError, setImageError] = useState(false);

  const defaultFallbackClassName =
    fallbackClassName ||
    `md:w-10 md:h-10 shrink-0 ${bg} ${text} flex items-center font-medium justify-center rounded-full`;

  // Show fallback if no image URL or if image failed to load
  if (!imageUrl || imageError) {
    return (
      <span className={defaultFallbackClassName}>
        {getInitials(fullName ?? email ?? "----")}
      </span>
    );
  }

  const imageSrc = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
    ? `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/${imageUrl}`
    : "/images/arinaProfile.png";

  return (
    <Image
      src={imageSrc}
      alt="Profile"
      className={className}
      width={width}
      height={height}
      unoptimized
      onError={() => setImageError(true)}
    />
  );
}
