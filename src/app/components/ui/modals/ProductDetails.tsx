import React from "react";
import AppModal, { ModalPosition } from "./AppModal";
import OrderDetail from "../../../../../public/icons/OrdeerDetail";

import { ShopingCartIcon } from "@/icons";
import ProductImage from "@/app/components/ui/ProductImage";

interface ProductDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  product: product | null;
  onClick: () => void;
  showActionButton?: boolean;
}

type product = {
  id: number;
  title: string;
  productForm: string;
  category: string;
  price: string;
  description: string;
  primaryImage?: string;
  tags?: string[];
  stock?: number;
  totalInventory?: number;
  inStock?: boolean;
  variants?:
    | {
        sku?: string | null;
      }[]
    | null;
};

const ProductDetails: React.FC<ProductDetailsProps> = ({
  isOpen,
  onClose,
  product,
  onClick,
  showActionButton = true,
}) => {
  if (!product) return null;

  const resolvedStock =
    typeof product.stock === "number"
      ? product.stock
      : typeof product.totalInventory === "number"
      ? product.totalInventory
      : undefined;
  const isOutOfStock =
    typeof resolvedStock === "number"
      ? resolvedStock <= 0
      : product.inStock === false;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<OrderDetail />}
      title="Product Details"
      position={ModalPosition.RIGHT}
      showFooter={showActionButton}
      onConfirm={showActionButton ? onClick : undefined}
      confirmLabel="Request from Doctor"
      hideCancelBtn={true}
      outSideClickClose={false}
      btnFullWidth={showActionButton}
      btnIcon={showActionButton ? <ShopingCartIcon fill="#fff" /> : undefined}
      confimBtnDisable={showActionButton ? isOutOfStock : undefined}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 border-b border-gray-200 pb-4 md:pb-8">
            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
              <ProductImage
                width={80}
                height={80}
                src={product.primaryImage || ""}
                alt={product.title}
                className="h-full object-contain"
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between flex-1 gap-2 md:gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold  text-gray-800">
                  {product.title}
                </h2>
                <p className="text-base font-semibold text-gray-800">
                  {product.price}
                </p>
                <div className="flex items-center gap-2 md:gap-3 text-xs font-normal text-gray-800">
                  <span>{product?.variants?.[0]?.sku || " "}</span>
                  <span className="border-l border-gray-200 pl-2 md:pl-3">
                    Injectable
                  </span>
                  <span className="border-l border-gray-200 pl-2 md:pl-3">
                    Rx Required
                  </span>
                </div>
              </div>
              {product?.tags?.length && (
                <div className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 w-fit self-start md:self-auto">
                  <p className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                    {product?.tags[0]}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className=""
          dangerouslySetInnerHTML={{ __html: product.description || "" }}
        ></div>
      </div>
    </AppModal>
  );
};

export default ProductDetails;

interface InfoBlockProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  list?: string[];
}

const InfoBlock: React.FC<InfoBlockProps> = ({
  icon,
  title,
  description,
  list,
}) => {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 pb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      </div>
      {description && (
        <p className="text-sm font-normal text-gray-700">{description}</p>
      )}
      {list && (
        <ul className="list-disc list-outside pl-5 text-sm font-normal text-gray-700 flex flex-col gap-2">
          {list.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
