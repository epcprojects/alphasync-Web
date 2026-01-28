"use client";

import { CrossIcon } from "@/icons";
import React, { useMemo, useRef, useState } from "react";

type TagInputProps = {
  label?: string;
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function TagInput({
  label = "Tags",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  className = "",
}: TagInputProps) {
  const [internalTags, setInternalTags] = useState<string[]>(
    value ?? ["Peptides", "Muscle Growth"],
  );
  const tags = value ?? internalTags;

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalizedSet = useMemo(() => {
    return new Set(tags.map((t) => t.trim().toLowerCase()));
  }, [tags]);

  const setTags = (next: string[]) => {
    if (onChange) onChange(next);
    if (!value) setInternalTags(next);
  };

  const commitTag = (raw: string) => {
    const cleaned = raw.trim();
    if (!cleaned) return;

    const key = cleaned.toLowerCase();
    if (normalizedSet.has(key)) {
      setInput(""); // still clear input to feel responsive
      return;
    }

    setTags([...tags, cleaned]);
    setInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <span className="block mb-1 text-sm text-gray-700 font-medium text-start">
          {label}
        </span>
      ) : null}

      <div
        className={`flex min-h-12 w-full flex-wrap items-center gap-2 rounded-lg border border-lightGray bg-white px-3 py-2 ${
          disabled ? "opacity-60" : ""
        }`}
        onMouseDown={() => {
          if (!disabled) inputRef.current?.focus();
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-0.5 rounded-lg border border-gray-200 break-all bg-gray-50 ps-3 py-0.5 pe-1.5 font-medium text-sm text-gray-700"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="grid h-4 w-4 place-items-center justify-center cursor-pointer rounded-full text-gray-400 hover:bg-slate-200 hover:text-slate-700"
                aria-label={`Remove ${tag}`}
              >
                <CrossIcon height="12" width="12" />
              </button>
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          disabled={disabled}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-gray-500 placeholder:font-normal"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitTag(input);
            }

            // nice-to-have: Backspace removes last tag when input empty
            if (e.key === "Backspace" && !input && tags.length > 0) {
              setTags(tags.slice(0, -1));
            }
          }}
          onBlur={() => {
            // click outside => add tag
            commitTag(input);
          }}
        />
      </div>
    </div>
  );
}
