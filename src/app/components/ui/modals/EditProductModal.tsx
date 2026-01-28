"use client";

import { useState } from "react";
import Dropdown from "../inputs/ThemeDropDown";
import ThemeInput from "../inputs/ThemeInput";
import AppModal, { ModalPosition } from "./AppModal";
import { InventoryIcon } from "@/icons";
import TagInput from "../inputs/TagInput";

import { Editor } from "primereact/editor";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProductModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  const categories = [
    { value: "healing-peptides", label: "Healing Peptides" },
    { value: "regenerative-therapies", label: "Regenerative Therapies" },
    { value: "anti-aging", label: "Anti-Aging Solutions" },
    { value: "cellular-repair", label: "Cellular Repair" },
    { value: "skin-rejuvenation", label: "Skin Rejuvenation" },
    { value: "wellness-optimization", label: "Wellness Optimization" },
    { value: "hormone-balance", label: "Hormone Balance" },
    { value: "immune-support", label: "Immune Support" },
    { value: "metabolic-health", label: "Metabolic Health" },
    { value: "longevity-medicine", label: "Longevity Medicine" },
  ];

  const [category, setCategory] = useState<string | undefined>();

  const [tags, setTags] = useState<string[]>(["Peptides", "Muscle Growth"]);

  const [desc, setDesc] = useState("");

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
  const remaining = MAX_CHARS - charCount;
  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      icon={<InventoryIcon fill="#2862A9" height={"20"} width={"20"} />}
      title="Edit Product"
      position={ModalPosition.RIGHT}
      onConfirm={handleSubmit}
      confirmLabel={"Save Changes"}
      cancelLabel="Cancel"
      // confimBtnDisable={!!error}
      outSideClickClose={false}
      btnFullWidth
    >
      <div className="space-y-4">
        <ThemeInput label="Title" onChange={() => {}} />

        <Dropdown
          label="Category"
          options={categories}
          value={category}
          onChange={setCategory}
          placeholder="Select Language"
          showSearch
        />

        <ThemeInput label="Manufacturer" onChange={() => {}} />

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
          <div className="mt-1.5 text-sm  text-tertiary ">
            {charCount}/{MAX_CHARS} characters left
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default EditProductModal;
