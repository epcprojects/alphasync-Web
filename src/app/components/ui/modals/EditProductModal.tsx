"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import ThemeInput from "../inputs/ThemeInput";
import AppModal, { ModalPosition } from "./AppModal";
import { InventoryIcon } from "@/icons";
import TagInput from "../inputs/TagInput";
import { Editor } from "primereact/editor";
import { UPDATE_PRODUCT } from "@/lib/graphql/mutations";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
/**
 * Product shape accepted by EditProductModal.
 * Compatible with FetchProductResponse["fetchProduct"] and
 * AllProductsResponse["allProducts"]["allData"][0].
 */
export interface EditProductModalProduct {
  id: string;
  title?: string | null;
  description?: string | null;
  vendor?: string | null;
  productType?: string | null;
  tags?: string[] | null;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: EditProductModalProduct | null;
  onSuccess?: () => void;
}

const EditProductModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [vendor, setVendor] = useState("");
  const [desc, setDesc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [updateProduct, { loading: updateLoading }] = useMutation(UPDATE_PRODUCT);

  // Initialize form when product changes or modal opens
  useEffect(() => {
    if (product && isOpen) {
      setTitle(product.title ?? "");
      setTags(product.tags && product.tags.length > 0 ? [...product.tags] : []);
      setVendor(product.vendor ?? "");
      setDesc(product.description ?? "");
      setErrors({});
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!product?.id) return;

    // Prevent removing content that was already there
    const hadTitle = Boolean(product.title?.trim());
    const hadDescription = Boolean(
      product.description && getPlainTextLength(product.description) > 0
    );
    const hadVendor = Boolean(product.vendor?.trim());
    const hadTags = Boolean(product.tags && product.tags.length > 0);

    const newErrors: Record<string, string> = {};

    if (hadTitle && !title.trim()) {
      newErrors.title = "Title is required and cannot be cleared.";
    }
    if (hadDescription && getPlainTextLength(desc) === 0) {
      newErrors.description = "Description is required and cannot be cleared.";
    }
    if (hadVendor && !vendor.trim()) {
      newErrors.vendor = "Manufacturer is required and cannot be cleared.";
    }
    if (hadTags && tags.length === 0) {
      newErrors.tags = "At least one tag is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await updateProduct({
        variables: {
          id: product.id,
          title: title.trim() || null,
          description: desc.trim() || null,
          vendor: vendor.trim() || null,
          tags: tags.length > 0 ? tags : null,
        },
      });
      showSuccessToast("Product updated successfully!");
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("Error updating product:", err);
      showErrorToast("Failed to update product. Please try again.");
    }
  };

  const handleClose = () => {
    onClose();
  };

  const headerTemplate = (
    <span className="ql-formats">
      <button className="ql-bold" />
      <button className="ql-italic" />
      <button className="ql-underline" />
      <span className="ql-separator" />
      <button className="ql-list" value="bullet" />
      <button className="ql-align" value="" />
      <button className="ql-align" value="center" />
      <button className="ql-list" value="ordered" />
    </span>
  );

  const MAX_CHARS = 2000;
  const getPlainTextLength = (html: string) =>
    html.replace(/<[^>]*>/g, "").trim().length;
  const charCount = getPlainTextLength(desc);

  const validateField = (
    field: "title" | "vendor" | "tags" | "description"
  ): string | null => {
    if (!product) return null;
    const hadTitle = Boolean(product.title?.trim());
    const hadDescription = Boolean(
      product.description && getPlainTextLength(product.description) > 0
    );
    const hadVendor = Boolean(product.vendor?.trim());
    const hadTags = Boolean(product.tags && product.tags.length > 0);

    if (field === "title" && hadTitle && !title.trim())
      return "Title is required and cannot be cleared.";
    if (field === "vendor" && hadVendor && !vendor.trim())
      return "Manufacturer is required and cannot be cleared.";
    if (field === "tags" && hadTags && tags.length === 0)
      return "At least one tag is required.";
    if (field === "description" && hadDescription && getPlainTextLength(desc) === 0)
      return "Description is required and cannot be cleared.";
    return null;
  };

  const handleBlur = (field: "title" | "vendor" | "tags" | "description") => {
    const err = validateField(field);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });
  };

  const hasChanges = (() => {
    if (!product) return false;
    const origTitle = product.title ?? "";
    const origVendor = product.vendor ?? "";
    const origTags = product.tags && product.tags.length > 0 ? [...product.tags] : [];
    const origDesc = product.description ?? "";
    if (title.trim() !== origTitle.trim()) return true;
    if (vendor.trim() !== origVendor.trim()) return true;
    if (origTags.length !== tags.length) return true;
    if (origTags.some((t, i) => t !== tags[i])) return true;
    if (desc !== origDesc) return true;
    return false;
  })();

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      icon={<InventoryIcon fill="#2862A9" height={"20"} width={"20"} />}
      title="Edit Product"
      position={ModalPosition.RIGHT}
      onConfirm={handleSubmit}
      confirmLabel={updateLoading ? "Saving..." : "Save Changes"}
      cancelLabel="Cancel"
      confimBtnDisable={
        !hasChanges ||
        Object.keys(errors).length > 0 ||
        updateLoading
      }
      outSideClickClose={false}
      btnFullWidth
    >
      <div className="space-y-4">
        <ThemeInput
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          onBlur={() => handleBlur("title")}
          error={!!errors.title}
          errorMessage={errors.title}
        />

        <ThemeInput
          label="Manufacturer"
          value={vendor}
          onChange={(e) => {
            setVendor(e.target.value);
            if (errors.vendor) setErrors((prev) => ({ ...prev, vendor: "" }));
          }}
          onBlur={() => handleBlur("vendor")}
          error={!!errors.vendor}
          errorMessage={errors.vendor}
        />

        <div>
          <TagInput
            label="Tags"
            value={tags}
            onChange={(newTags) => {
              setTags(newTags);
              if (errors.tags) setErrors((prev) => ({ ...prev, tags: "" }));
            }}
            onBlur={() => handleBlur("tags")}
            placeholder="Type and press Enter"
          />
          {errors.tags && (
            <p className="mt-1 text-sm text-red-500">{errors.tags}</p>
          )}
        </div>

        <div>
          <span className="block mb-1 text-sm text-slate-700 font-normal text-start">
            Description
          </span>
          <Editor
            value={desc}
            onTextChange={(e) => {
              const text = e.textValue ?? "";
              if (text.length <= MAX_CHARS) {
                setDesc(e.htmlValue ?? "");
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: "" }));
              }
            }}
            onBlur={() => handleBlur("description")}
            headerTemplate={headerTemplate}
            style={{ height: "200px" }}
            className={errors.description ? "[&_.ql-container]:border-red-500" : ""}
          />
          <div className="mt-1.5 flex justify-between text-sm">
            <span className={errors.description ? "text-red-500" : "text-tertiary"}>
              {errors.description || `${charCount}/${MAX_CHARS} characters left`}
            </span>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default EditProductModal;
