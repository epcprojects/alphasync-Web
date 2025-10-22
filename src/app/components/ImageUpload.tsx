"use client";
import { PlusIcon, TrashBinIcon } from "@/icons";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

interface ImageUploadProps {
  imageUrl?: string | null;
  placeholder?: string;
  onChange?: (file: File | null) => void;
  onDelete?: () => void;
  showTitle?: boolean;
  title?: string;
  subtitle?: string;
  roundedClass?: string;
  width?: number;
  height?: number;
  className?: string;
  accept?: string;
  userId?: string;
  onImageRemove?: () => Promise<void>;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  placeholder = "/images/arinaProfile.png",
  onChange,
  onDelete,
  showTitle = true,
  title = "Your photo",
  subtitle = "This will be displayed on your profile.",
  roundedClass = "rounded-full",
  width = 64,
  height = 64,
  className = "",
  accept = ".png,.jpg,.jpeg,.svg",
  userId,
  onImageRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>(imageUrl || placeholder);
  const [hasImage, setHasImage] = useState<boolean>(!!imageUrl);

  useEffect(() => {
    if (imageUrl) {
      setPreview(imageUrl);
      setHasImage(true);
    } else {
      setPreview(placeholder);
      setHasImage(false);
    }
  }, [imageUrl, placeholder]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
      setHasImage(true);
      onChange?.(file);
    }
  };

  const handleUpdateClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = async () => {
    if (onImageRemove) {
      try {
        await onImageRemove();
        setPreview(placeholder);
        setHasImage(false);
        onChange?.(null);
      } catch (error) {
        console.error("Error removing image:", error);
      }
    } else {
      setPreview(placeholder);
      setHasImage(false);
      onChange?.(null);
      onDelete?.();
    }
  };

  return (
    <div className={`${showTitle ? 'grid grid-cols-12 py-3 md:py-5 border-b border-b-gray-200' : 'flex items-center justify-between'} ${className}`}>
      {showTitle && (
        <div className="col-span-12 mb-3 sm:mb-0 md:col-span-4 lg:col-span-3">
          <label className="text-xs md:text-sm text-gray-700 font-semibold">
            {title}
          </label>
          <span className="block text-gray-600 text-xs md:text-sm">
            {subtitle}
          </span>
        </div>
      )}

      <div className={`${showTitle ? 'col-span-12 md:col-span-6' : ''} flex items-center justify-between w-full`}>
        <div className="relative flex items-center justify-center">
          <Image
            src={preview}
            alt="Profile"
            className={`${roundedClass} w-[${width}px] h-[${height}px] h-full !min-h-[${height}px] max-h-[${height}px] object-cover bg-gray-200`}
            width={width}
            height={height}
            style={{ height: height }}
          />

          {!hasImage && (
            <button
              onClick={handleUpdateClick}
              className={`${roundedClass} cursor-pointer absolute bg-gray-200 flex items-center justify-center h-full w-full`}
            >
              <PlusIcon />
            </button>
          )}
        </div>

        <div className="flex gap-3 items-center ml-auto">
          {hasImage && (
            <button
              onClick={handleDeleteClick}
              className="text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg cursor-pointer text-xs md:text-sm font-semibold flex items-center gap-1"
            >
              <TrashBinIcon width={14} height={14} />
              Delete
            </button>
          )}

          <button
            onClick={handleUpdateClick}
            className="text-gray-600 cursor-pointer hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold"
          >
            {hasImage ? "Update" : "Upload"}
          </button>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
