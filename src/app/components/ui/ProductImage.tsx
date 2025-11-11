import Image, { ImageProps } from "next/image";

type ProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK = "/images/products/p1.png";

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
  ...rest
}: ProductImageProps) {
  const resolvedSrc = buildImageSrc(src ?? undefined, fallbackSrc);

  return <Image alt={alt} src={resolvedSrc} {...rest} />;
}
