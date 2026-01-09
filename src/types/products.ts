// GraphQL response interface for ALL_PRODUCTS_INVENTORY query
export interface AllProductsResponse {
  allProducts: {
    allData: {
      id: string;
      title: string;
      customPrice?: number;
      description?: string;
      handle?: string;
      images?: string[];
      inStock?: boolean;
      isFavorited?: boolean;
      priceRange?: string;
      primaryImage?: string;
      productType?: string;
      shopifyId?: string;
      totalInventory?: number;
      vendor?: string;
      tags?: string[];
      variants: {
        id: string;
        shopifyVariantId: string;
        price: number;
        sku?: string;
      }[];
    }[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

// Transformed product interface for UI components
export interface ProductVariant {
  id?: string;
  shopifyVariantId?: string;
  price?: number;
  sku?: string;
}

export interface Product {
  id: number;
  originalId: string; // Add the original GraphQL ID
  title: string;
  description: string;
  category: string;
  stock: boolean;
  price: string;
  image: string;
  isFavourite: boolean;
  prescription: boolean;
  productForm: string;
  primaryImage?: string;
  tags?: string[];
  variants?: ProductVariant[];
}

// Product select dropdown item interface
export interface ProductDropdownItem {
  name: string;
  displayName: string;
  productId?: string;
  variantId?: string;
  price?: number;
  customPrice?: number;
  originalPrice?: number;
  variants?: ProductVariant[];
}

// Helper function to transform GraphQL product data to UI format
export const transformGraphQLProduct = (
  product: AllProductsResponse["allProducts"]["allData"][0],
  index: number
): Product => {
  const firstVariant = product.variants?.[0];
  const fallbackImage =
    product.images?.find(
      (image): image is string =>
        typeof image === "string" && image.trim().length > 0
    ) ?? "";
  const normalizedPrimaryImage =
    typeof product.primaryImage === "string" &&
    product.primaryImage.trim().length > 0
      ? product.primaryImage
      : fallbackImage;

  // Use customPrice if available, otherwise use variant price
  const priceValue =
    product.customPrice != null && product.customPrice !== undefined
      ? product.customPrice
      : firstVariant?.price ?? 0;

  return {
    id: parseInt(product.id) || index + 1,
    originalId: product.id, // Store the original GraphQL ID
    title: product.title,
    description: product.description || "",
    category: product.productType || "Peptide",
    stock: product.inStock ?? false,
    price: `$${priceValue.toFixed(2)}`,
    image: normalizedPrimaryImage,
    primaryImage: normalizedPrimaryImage || undefined,
    isFavourite: product.isFavorited || false,
    prescription: false, // Default value, can be enhanced later
    productForm: "Injectable", // Default value, can be enhanced later
    tags: product.tags?.length ? product.tags : undefined,
    variants: product.variants?.map((variant) => ({
      id: variant.id,
      shopifyVariantId: variant.shopifyVariantId,
      price: variant.price,
      sku: variant.sku,
    })),
  };
};

// GraphQL response interface for FETCH_PRODUCT query
export interface FetchProductResponse {
  fetchProduct: {
    customPrice?: number;
    customPriceChangeHistory?: {
      customPrice: number;
      id: string;
    }[];
    markupPercentage?: number;
    description?: string;
    handle?: string;
    id: string;
    images?: string[];
    tags?: string[];
    inStock?: boolean;
    isFavorited?: boolean;
    priceRange?: string;
    primaryImage?: string;
    productType?: string;
    shopifyId?: string;
    title: string;
    totalInventory?: number;
    price?: number;
    vendor?: string;
    variants: {
      price: number;
      id: string;
      shopifyVariantId: string;
      sku: string;
    }[];
  };
}

// Helper function to transform GraphQL product data to dropdown format
export const transformToDropdownItem = (
  product: AllProductsResponse["allProducts"]["allData"][0]
): ProductDropdownItem => {
  const firstVariant = product.variants?.[0];
  const originalPrice = firstVariant?.price;
  // Use customPrice if available, otherwise use original price
  const price = product.customPrice ?? originalPrice;
  return {
    name: product.title,
    displayName: product.title,
    productId: product.id,
    variantId: firstVariant?.shopifyVariantId,
    price: price,
    customPrice: product.customPrice,
    originalPrice: originalPrice,
    variants: product.variants?.map((variant) => ({
      id: variant.id,
      shopifyVariantId: variant.shopifyVariantId,
      price: variant.price,
      sku: variant.sku,
    })),
  };
};
