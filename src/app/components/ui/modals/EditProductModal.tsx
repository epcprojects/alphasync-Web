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

  const [updateProduct, { loading: updateLoading }] = useMutation(UPDATE_PRODUCT);

  // Initialize form when product changes or modal opens
  useEffect(() => {
    if (product && isOpen) {
      setTitle(product.title ?? "");
      setTags(product.tags && product.tags.length > 0 ? [...product.tags] : []);
      setVendor(product.vendor ?? "");
      setDesc(product.description ?? "");
    }
  }, [product, isOpen]);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!product?.id) return;

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
      outSideClickClose={false}
      btnFullWidth
    >
      <div className="space-y-4">
        <ThemeInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <ThemeInput
          label="Manufacturer"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
        />

        <TagInput
          label="Tags"
          value={tags}
          onChange={setTags}
          placeholder="Type and press Enter"
        />

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
              }
            }}
            headerTemplate={headerTemplate}
            style={{ height: "200px" }}
          />
          <div className="mt-1.5 text-sm text-tertiary">
            {charCount}/{MAX_CHARS} characters left
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default EditProductModal;
