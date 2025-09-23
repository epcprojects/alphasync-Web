"use client";
import { PlusIcon } from "@/icons";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

interface AvatarUploaderProps {
  initialImage?: string;
  placeholder?: string;
  onChange?: (file: File | null) => void;
  showTitle?: boolean;
  roundedClass?: string;
  width?: number;
  height?: number;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  initialImage,
  placeholder = "/images/default-avatar.png",
  onChange,
  showTitle,
  roundedClass = "rounded-full",
  width = 64,
  height = 64,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>(initialImage || placeholder);

  useEffect(() => {
    if (initialImage) {
      setPreview(initialImage);
    }
  }, [initialImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
      onChange?.(file); // send file to parent for upload
    }
  };

  const handleUpdateClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = () => {
    setPreview(placeholder);
    onChange?.(null); // notify parent that image is deleted
  };

  return (
    <div className="col-span-6 flex items-center justify-between">
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
            className={`${roundedClass} w-[${width}px] h-[${height}px] h-full min-h-[${height}px] max-h-[${height}px] object-cover bg-gray-200`}
            width={width}
            height={height}
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

      <div className="flex gap-4 items-center">
        {preview !== placeholder && (
          <button
            onClick={handleDeleteClick}
            className="text-red-500 cursor-pointer text-xs md:text-sm font-semibold"
          >
            Delete
          </button>
        )}

        <button
          onClick={handleUpdateClick}
          className="text-gray-600 cursor-pointer text-xs md:text-sm font-semibold"
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
    </div>
  );
};

export default AvatarUploader;
