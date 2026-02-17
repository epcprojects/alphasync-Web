"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";

type ProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
  /** When set and not "Alpha BioMed", rx-placeholder is used as fallback instead of the default. */
  vendor?: string | null;
};

const DEFAULT_FALLBACK = "/images/products/placeholder.png";
const RX_PLACEHOLDER = "/images/products/rx-placeholder.png";

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

function getFallbackForVendor(vendor?: string | null, fallbackSrc?: string): string {
  if (vendor != null && vendor !== "Alpha BioMed") {
    return RX_PLACEHOLDER;
  }
  return fallbackSrc ?? DEFAULT_FALLBACK;
}

export default function ProductImage({
  src,
  alt = "Product image",
  fallbackSrc,
  vendor,
  width,
  height,
  ...rest
}: ProductImageProps) {
  const effectiveFallback = getFallbackForVendor(vendor, fallbackSrc ?? DEFAULT_FALLBACK);
  const [imgSrc, setImgSrc] = useState<string>(() =>
    buildImageSrc(src ?? undefined, effectiveFallback)
  );
  const [useNativeImg, setUseNativeImg] = useState(false);

  useEffect(() => {
    const nextFallback = getFallbackForVendor(vendor, fallbackSrc ?? DEFAULT_FALLBACK);
    setUseNativeImg(false);
    setImgSrc(buildImageSrc(src ?? undefined, nextFallback));
  }, [src, fallbackSrc, vendor]);

  const handleError = () => {
    if (!useNativeImg) {
      setUseNativeImg(true);
      setImgSrc(effectiveFallback);
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
          if (imgSrc === effectiveFallback) {
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
      unoptimized
      onError={handleError}
      {...rest}
    />
  );
}
