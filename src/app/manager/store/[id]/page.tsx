"use client";

import {
  EmptyResult,
  Pagination,
  ShopProductCard,
  Skeleton,
} from "@/app/components";
import { useQuery } from "@apollo/client/react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { DeliveryBoxIcon, KeyLeftIcon, SearchIcon, ShoppingCartRemoveIcon } from "@/icons";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { ALL_PRODUCTS_INVENTORY } from "@/lib/graphql/queries";
import type { AllProductsResponse } from "@/types/products";

const Page = () => {
  const isMobile = useIsMobile();
  const params = useParams();
  const router = useRouter();
  const doctorId = params?.id as string | undefined;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error } = useQuery<AllProductsResponse>(
    ALL_PRODUCTS_INVENTORY,
    {
      variables: {
        search: debouncedSearch || null,
        page: currentPage,
        perPage: itemsPerPage,
        markedUp: true,
        doctorId: doctorId,
      },
      fetchPolicy: "network-only",
      skip: !doctorId,
    }
  );

  const pageCount = data?.allProducts?.totalPages || 1;

  const shopProducts = useMemo(() => {
    const allData = data?.allProducts?.allData ?? [];
    return allData.map((p, idx) => {
      const firstVariant = p.variants?.[0];
      const customerPrice =
        p.customPrice != null && p.customPrice !== undefined
          ? p.customPrice
          : (firstVariant?.price ?? 0);

      const basePrice = (() => {
        const priceRangeStr = (p.priceRange || "").trim();
        if (priceRangeStr.startsWith("$")) {
          return priceRangeStr.split(" - ")[0] || priceRangeStr;
        }
        const match = priceRangeStr.match(/[\d.]+/);
        if (match) {
          const n = Number(match[0]);
          if (!Number.isNaN(n)) return `$${n.toFixed(2)}`;
        }
        if (firstVariant?.price != null)
          return `$${Number(firstVariant.price).toFixed(2)}`;
        return undefined;
      })();

      return {
        id: Number(p.id) || idx + 1,
        originalId: p.id,
        title: p.title,
        description: p.description || "",
        category: p.productType || (p.tags?.[0] ?? "N/A"),
        stock: p.totalInventory ?? 0,
        price: `$${Number(customerPrice).toFixed(2)}`,
        basePrice,
        image:
          (typeof p.primaryImage === "string" &&
          p.primaryImage.trim().length > 0
            ? p.primaryImage
            : p.images?.find(
                (img) => typeof img === "string" && img.trim().length > 0,
              )) || "",
        isFavourite: !!p.isFavorited,
      };
    });
  }, [data]);

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  if (!doctorId) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <p className="text-gray-600">Invalid doctor.</p>
        <Link href="/manager/doctors" className="text-primary hover:underline">
          Back to Doctors
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
        <div className="bg-white rounded-xl border border-red-200 p-6 md:p-12 text-center text-red-500 text-sm">
          Failed to load store products. Please try again.
        </div>
        <Link href="/manager/doctors" className="text-primary hover:underline">
          Back to Doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full flex flex-col gap-4 md:gap-6 pt-2 mx-auto">
      <div className="flex lg:flex-row flex-col lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/manager/doctors"
            className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11 hover:bg-gray-50"
            aria-label="Back to doctors"
          >
            <KeyLeftIcon
              height={isMobile ? '16' : '24'}
              width={isMobile ? '16' : '24'}
            />
          </Link>
          <span className="flex items-center justify-center rounded-full shrink-0 bg-white w-8 h-8 shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-1px_rgba(0,0,0,0.06)] md:w-11 md:h-11">
            <DeliveryBoxIcon
              height={isMobile ? 16 : 24}
              width={isMobile ? 16 : 24}
            />
          </span>
          <div>
            <h2 className="lg:w-full text-black font-semibold text-base md:text-xl">
              Doctor&apos;s Store
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              View-only: products this doctor has in their store.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-2 lg:gap-3">
          <div className="sm:bg-white rounded-full flex-col sm:flex-row w-full flex items-center gap-1 md:gap-2 p-0 md:px-2.5 md:py-2 lg:shadow lg:w-fit">
            <div className="flex items-center relative w-full p-1 sm:p-0 rounded-full bg-white sm:bg-transparent shadow-table sm:shadow-none">
              <span className="absolute left-3">
                <SearchIcon
                  height={isMobile ? "16" : "20"}
                  width={isMobile ? "16" : "20"}
                />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="ps-8 md:ps-10 pe-3 md:pe-4 py-1.5 text-base md:py-2 focus:bg-white bg-gray-100 w-full md:min-w-56 outline-none focus:ring focus:ring-gray-200 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <Skeleton className="w-full h-48 rounded-lg mb-4" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : shopProducts.length === 0 ? (
        <EmptyResult
          title={"This store is empty."}
          description={
            <p className="font-medium text-lg text-gray-800">
              This doctor has no products in their store yet.
            </p>
          }
          icon={<ShoppingCartRemoveIcon />}
          buttonLabel="Back to Doctors"
          buttonOnClick={() => router.push("/manager/doctors")}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6">
            {shopProducts.map((product) => (
              <ShopProductCard
                key={product.originalId || product.id}
                product={product}
                viewOnly
              />
            ))}
          </div>

          {pageCount > 1 && (
            <Pagination
              currentPage={currentPage - 1}
              totalPages={pageCount}
              onPageChange={(selectedPage) =>
                handlePageChange(selectedPage + 1)
              }
            />
          )}
        </>
      )}
    </div>
  );
};

export default Page;
