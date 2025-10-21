"use client";
import React from "react";
import SelectGroupDropdown from "../dropdowns/selectgroupDropdown";
import { useQuery } from "@apollo/client/react";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import { AllProductsResponse, ProductDropdownItem, transformToDropdownItem } from "@/types/products";


interface ProductSelectProps {
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  errors?: string;
  touched?: boolean;
  disabled?: boolean;
  onProductChange?: (product: ProductDropdownItem | null) => void;
  placeholder?: string;
  required?: boolean;
  showLabel?: boolean;
  paddingClasses?: string;
  optionPaddingClasses?: string;
}


const ProductSelect: React.FC<ProductSelectProps> = ({
  selectedProduct,
  setSelectedProduct,
  errors = "",
  touched = false,
  disabled = false,
  onProductChange,
  placeholder,
  required = true,
  showLabel = true,
  paddingClasses = "py-2.5 h-11 px-2",
  optionPaddingClasses = "p-1",
}) => {
  // GraphQL query to fetch products
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery<AllProductsResponse>(ALL_PRODUCTS_INVENTORY, {
    fetchPolicy: "network-only",
  });

  // Transform GraphQL product data to match dropdown format
  const products = productsData?.allProducts.allData?.map(transformToDropdownItem) || [];

  const handleProductChange = (val: string | string[]) => {
    const productName = Array.isArray(val) ? val[0] : val;
    setSelectedProduct(productName);
    
    // Find the selected product and call the callback
    if (onProductChange) {
      const selectedProductData = products.find(p => p.name === productName);
      onProductChange(selectedProductData || null);
    }
  };

  const defaultPlaceholder = productsLoading 
    ? "Loading products..." 
    : products.length === 0 
    ? "No products available" 
    : "Select a product";

  return (
    <div>
      {productsError && (
        <p className="text-red-500 text-xs mb-2">
          Error loading products: {productsError.message}
        </p>
      )}
      <SelectGroupDropdown
        selectedGroup={selectedProduct}
        setSelectedGroup={handleProductChange}
        groups={products}
        errors={errors}
        name="Product:"
        multiple={false}
        placeholder={placeholder || defaultPlaceholder}
        searchTerm=""
        setSearchTerm={() => {}}
        isShowDrop={!productsLoading && !disabled}
        required={required}
        paddingClasses={paddingClasses}
        optionPaddingClasses={optionPaddingClasses}
        showLabel={showLabel}
        showIcon={false}
        disabled={disabled || productsLoading}
      />
      {errors && touched && (
        <p className="text-red-500 text-xs">{errors}</p>
      )}
    </div>
  );
};

export default ProductSelect;
