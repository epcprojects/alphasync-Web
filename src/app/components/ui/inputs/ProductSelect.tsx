"use client";
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import SelectGroupDropdown from "../dropdowns/selectgroupDropdown";
import { useQuery } from "@apollo/client/react";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import {
  AllProductsResponse,
  ProductDropdownItem,
  transformToDropdownItem,
} from "@/types/products";

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
  fetchMarkedUpProductsOnly?: boolean;
}

export interface ProductSelectRef {
  refetch: () => void;
}

const ProductSelect = forwardRef<ProductSelectRef, ProductSelectProps>(
  (
    {
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
      fetchMarkedUpProductsOnly = false,
    },
    ref
  ) => {
    const [searchTerm, setSearchTerm] = useState("");

    // GraphQL query to fetch products
    const {
      data: productsData,
      loading: productsLoading,
      error: productsError,
      refetch,
    } = useQuery<AllProductsResponse>(ALL_PRODUCTS_INVENTORY, {
      fetchPolicy: "no-cache",
      variables: {
        perPage: 200,
        markedUp: fetchMarkedUpProductsOnly
          ? fetchMarkedUpProductsOnly
          : undefined,
      },
      // skip: !patientId,
      notifyOnNetworkStatusChange: true,
    });

    // Expose refetch function via ref
    // useImperativeHandle(ref, () => ({
    //   refetch: () => {
    //     if (patientId && refetch) {
    //       refetch({
    //         perPage: 200,
    //         // patientId: patientId,
    //       });
    //     }
    //   },
    // }));
    // useImperativeHandle(ref, () => ({
    //   refetch: () => {
    //     if (refetch) {
    //       refetch({
    //         perPage: 200,
    //       });
    //     }
    //   },
    // }));

    // Refetch products when patientId changes to ensure fresh data
    // useEffect(() => {
    //   if (patientId && refetch) {
    //     refetch({
    //       perPage: 200,
    //       // patientId: patientId,
    //     });
    //   }
    // }, [patientId, refetch]);
    // useEffect(() => {
    //   if (refetch) {
    //     refetch({
    //       perPage: 200,
    //     });
    //   }
    // }, [refetch]);

    // Transform GraphQL product data to match dropdown format
    const products =
      productsData?.allProducts.allData?.map(transformToDropdownItem) || [];

    const handleProductChange = (val: string | string[]) => {
      const productName = Array.isArray(val) ? val[0] : val;
      setSelectedProduct(productName);

      // Find the selected product and call the callback
      if (onProductChange) {
        const selectedProductData = products.find(
          (p) => p.name === productName
        );
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
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isShowDrop={!productsLoading && !disabled}
          required={required}
          paddingClasses={paddingClasses}
          optionPaddingClasses={optionPaddingClasses}
          showLabel={showLabel}
          showIcon={false}
          disabled={disabled || productsLoading}
        />
        {errors && touched && <p className="text-red-500 text-xs">{errors}</p>}
      </div>
    );
  }
);

ProductSelect.displayName = "ProductSelect";

export default ProductSelect;
