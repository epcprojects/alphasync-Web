"use client";
import { PlusIcon } from "@/icons";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import ImageCropper from "./ui/ImageCropper";

interface AvatarUploaderProps {
  initialImage?: string;
  placeholder?: string;
  onChange?: (file: File | null) => void;
  showTitle?: boolean;
  roundedClass?: string;
  width?: number;
  height?: number;
  enableCrop?: boolean;
  cropAspect?: number;
  cropShape?: "rect" | "round";
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  initialImage,
  placeholder = "/images/default-avatar.png",
  onChange,
  showTitle,
  roundedClass = "rounded-full",
  width = 64,
  height = 64,
  enableCrop = true,
  cropAspect = 1,
  cropShape = "round",
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>(initialImage || placeholder);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");

  useEffect(() => {
    if (initialImage) {
      setPreview(initialImage);
    }
  }, [initialImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      if (enableCrop) {
        setImageToCrop(fileUrl);
        setShowCropper(true);
      } else {
        setPreview(fileUrl);
        onChange?.(file);
      }
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    const fileUrl = URL.createObjectURL(croppedFile);
    setPreview(fileUrl);
    onChange?.(croppedFile);
    setShowCropper(false);
    setImageToCrop("");
  };

  const handleCropperClose = () => {
    setShowCropper(false);
    setImageToCrop("");
    // Clean up the object URL
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
  };

  const handleUpdateClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = () => {
    setPreview(placeholder);
    onChange?.(null);
  };

  return (
    <div className="col-span-12 md:col-span-6 flex items-center justify-between">
      <div>
        {showTitle && (
          <span className="font-medium text-gray-700 text-xs md:text-sm mb-1">
            Profile Picture
          </span>
        )}
        <div className="relative flex items-center justify-center">
          <Image
            src={preview}
            alt="Avatar"
            className={`${roundedClass} w-[${width}px] h-[${height}px] h-full !min-h-[${height}px] max-h-[${height}px] object-cover bg-gray-200`}
            width={width}
            height={height}
            style={{ height: height }}
            unoptimized
          />

          {preview === placeholder && (
            <button
              onClick={handleUpdateClick}
              className={`${roundedClass} cursor-pointer absolute bg-gray-200 flex items-center justify-center h-full w-full`}
            >
              <PlusIcon />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 items-center">
        {preview !== placeholder && (
          <button
            onClick={handleDeleteClick}
            className="text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg cursor-pointer text-xs md:text-sm font-semibold"
          >
            Delete
          </button>
        )}

        <button
          onClick={handleUpdateClick}
          className="text-gray-600 cursor-pointer hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold"
        >
          {preview !== placeholder ? "Update" : "Upload"}
        </button>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".png,.jpg,.jpeg,.svg"
          onChange={handleFileChange}
        />
      </div>

      {/* Image Cropper Modal */}
      {enableCrop && (
        <ImageCropper
          isOpen={showCropper}
          onClose={handleCropperClose}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          aspect={cropAspect}
          cropShape={cropShape}
        />
      )}
    </div>
  );
};

export default AvatarUploader;
