"use client";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

interface AvatarUploaderProps {
  initialImage?: string; // already uploaded image from backend
  placeholder?: string; // fallback avatar
  onChange?: (file: File | null) => void; // return selected file to parent
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  initialImage,
  placeholder = "/images/default-avatar.png",
  onChange,
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
      <Image
        src={preview}
        alt="Avatar"
        className="rounded-full object-cover"
        width={64}
        height={64}
      />

      <div className="flex gap-4 items-center">
        <button
          onClick={handleDeleteClick}
          className="text-red-500 cursor-pointer text-xs md:text-sm font-semibold"
        >
          Delete
        </button>

        <button
          onClick={handleUpdateClick}
          className="text-gray-600 cursor-pointer text-xs md:text-sm font-semibold"
        >
          Update
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
