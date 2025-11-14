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
      }[];
    }[];
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
  };
}

// Transformed product interface for UI components
export interface Product {
  id: number;
  originalId: string; // Add the original GraphQL ID
  title: string;
  description: string;
  category: string;
  stock: number;
  price: string;
  image: string;
  isFavourite: boolean;
  prescription: boolean;
  productForm: string;
  primaryImage?: string;
  tags?: string[];
}

// Product select dropdown item interface
export interface ProductDropdownItem {
  name: string;
  displayName: string;
  productId?: string;
  variantId?: string;
  price?: number;
}

// Helper function to transform GraphQL product data to UI format
export const transformGraphQLProduct = (
  product: AllProductsResponse["allProducts"]["allData"][0],
  index: number
): Product => {
  const firstVariant = product.variants?.[0];
  return {
    id: parseInt(product.id) || index + 1,
    originalId: product.id, // Store the original GraphQL ID
    title: product.title,
    description: product.description || "",
    category: product.productType || "Peptide",
    stock: product.totalInventory || 0,
    price: firstVariant ? `$${firstVariant.price}` : "$0.00",
    image: product.primaryImage || "",
    isFavourite: product.isFavorited || false,
    prescription: false, // Default value, can be enhanced later
    productForm: "Injectable", // Default value, can be enhanced later
    tags: product.tags?.length ? product.tags : undefined,
  };
};

// GraphQL response interface for FETCH_PRODUCT query
export interface FetchProductResponse {
  fetchProduct: {
    customPrice?: number;
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
  return {
    name: product.title,
    displayName: product.title,
    productId: product.id,
    variantId: firstVariant?.shopifyVariantId,
    price: firstVariant?.price,
  };
};
