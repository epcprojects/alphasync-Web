import React from "react";
import AppModal, { ModalPosition } from "./AppModal";
import OrderDetail from "../../../../../public/icons/OrdeerDetail";
import Image from "next/image";
import {
  Alert,
  Calendar,
  Doctor,
  File,
  Info,
  Learning,
  ShopingCartIcon,
  Target,
  Thermometer,
} from "@/icons";

interface ProductDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  product: product | null;
  onClick: () => void;
}

type product = {
  id: number;
  title: string;
  productForm: string;
  category: string;
  price: string;
};

const ProductDetails: React.FC<ProductDetailsProps> = ({
  isOpen,
  onClose,
  product,
  onClick,
}) => {
  if (!product) return null;
  const infoSections = [
    {
      title: "Overview",
      description:
        "BPC-157 is a synthetic peptide derived from a protective protein found naturally in human stomach acid. It has shown remarkable healing properties in numerous studies and is widely used for tissue repair and regeneration.",
      icon: <Info />,
    },
    {
      title: "Key Benefits",
      list: [
        "Accelerated wound healing and tissue repair",
        "Reduced inflammation throughout the body",
        "Enhanced recovery from muscle, tendon, and ligament injuries",
        "Improved gut health and digestive function",
        "Neuroprotective effects on brain tissue",
        "Enhanced blood vessel formation (angiogenesis)",
      ],
      icon: <Target />,
    },
    {
      title: "How It Works",
      list: [
        "Promotes collagen synthesis for tissue repair",
        "Modulates growth factor expression",
        "Enhances cellular migration and proliferation",
        "Stabilizes cellular structures and reduces oxidative stress",
      ],
      icon: <Learning />,
    },
    {
      title: "Usage & Dosing",
      description:
        "Typically administered via subcutaneous injection. Common dosing ranges from 200-500mcg daily, divided into 1-2 injections.",
      icon: <Calendar />,
    },
    {
      title: "Potential Side Effects",
      list: [
        "Generally well-tolerated with minimal side effects",
        "Possible injection site irritation or redness",
        "Rare cases of mild nausea or dizziness",
      ],
      icon: <Info />,
    },
    {
      title: "Contraindications",
      list: [
        "Pregnancy and breastfeeding",
        "Active cancer or tumor growth",
        "Severe kidney or liver dysfunction",
      ],
      icon: <Alert />,
    },
    {
      title: "Storage Instructions",
      description:
        "Store in refrigerator (2-8°C). Once reconstituted, use within 30 days.",
      icon: <Thermometer />,
    },
    {
      title: "Clinical Research",
      description:
        "Over 50 published studies demonstrate BPC-157's safety and efficacy in promoting healing and reducing inflammation.",
      icon: <File />,
    },
    {
      title: "Drug Interactions",
      description:
        "No known major drug interactions. Consult your physician about all medications you're taking.",
      icon: <Doctor />,
    },
  ];
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<OrderDetail />}
      title="Product Details"
      position={ModalPosition.RIGHT}
      showFooter={true}
      onConfirm={onClick}
      confirmLabel="Request from Doctor"
      hideCancelBtn={true}
      btnFullWidth={true}
      btnIcon={<ShopingCartIcon fill="#fff" />}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 border-b border-gray-200 pb-4 md:pb-8">
            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
              <Image
                src="/images/products/p1.png"
                alt="Product"
                width={1024}
                height={1024}
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between flex-1 gap-2 md:gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base md:text-lg font-semibold line-clamp-1 text-gray-900">
                  {product.title}
                </h2>
                <p className="text-base md:text-lg font-semibold text-gray-800">
                  {product.price}
                </p>
                <div className="flex items-center gap-2 md:gap-3 text-xs font-normal text-gray-800">
                  <span>5 mg vial</span>
                  <span className="border-l border-gray-200 pl-2 md:pl-3">
                    Injectable
                  </span>
                  <span className="border-l border-gray-200 pl-2 md:pl-3">
                    Rx Required
                  </span>
                </div>
              </div>
              <div className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 w-fit self-start md:self-auto">
                <p className="text-xs md:text-sm font-medium text-gray-700 whitespace-nowrap">
                  {product.category}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          {infoSections.map((section, index) => (
            <InfoBlock
              key={index}
              icon={section.icon}
              title={section.title}
              description={section.description}
              list={section.list}
            />
          ))}
        </div>
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
        <h3 className="text-base font-medium text-gray-800">{title}</h3>
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
