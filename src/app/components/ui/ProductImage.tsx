"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";

type ProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK = "/images/products/placeholder.png";

const normalizePath = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

const buildImageSrc = (rawSrc?: string | null, fallback = DEFAULT_FALLBACK) => {
  if (!rawSrc || rawSrc.trim().length === 0) {
    return fallback;
  }

  if (rawSrc.startsWith("http://") || rawSrc.startsWith("https://")) {
    return rawSrc;
  }

  const baseUrl = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  if (!baseUrl) {
    return normalizePath(rawSrc);
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = rawSrc.replace(/^\/+/, "");

  return `${normalizedBase}/${normalizedPath}`;
};

export default function ProductImage({
  src,
  alt = "Product image",
  fallbackSrc = DEFAULT_FALLBACK,
  width,
  height,
  ...rest
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() =>
    buildImageSrc(src ?? undefined, fallbackSrc)
  );
  const [useNativeImg, setUseNativeImg] = useState(false);

  useEffect(() => {
    // Reset state and update image source when src prop changes
    setUseNativeImg(false);
    setImgSrc(buildImageSrc(src ?? undefined, fallbackSrc));
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!useNativeImg) {
      // Switch to fallback image using native img tag for better error handling
      setUseNativeImg(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Use Next.js Image with unoptimized for fallback when original image fails
  // This avoids the linting warning while still providing error handling
  if (useNativeImg) {
    return (
      <Image
        alt={alt}
        src={imgSrc}
        width={width}
        height={height}
        unoptimized
        onError={(e) => {
          // If fallback also fails, hide the broken image
          if (imgSrc === fallbackSrc) {
            (e.target as HTMLImageElement).style.display = "none";
          }
        }}
        style={{ objectFit: "contain", maxWidth: "100%", height: "auto" }}
        className={rest.className}
        {...rest}
      />
    );
  }

  return (
    <Image
      alt={alt}
      src={imgSrc}
      width={width}
      height={height}
      onError={handleError}
      {...rest}
    />
  );
}
