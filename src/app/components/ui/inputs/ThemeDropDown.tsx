// "use client";

// import React, { Fragment, useMemo, useState } from "react";
// import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
// import { ArrowDownIcon } from "@/icons";

// type DropdownOption = {
//   label: string;
//   value: string;
// };

// interface DropdownProps {
//   options: DropdownOption[];
//   value?: string;
//   placeholder?: string;
//   onChange: (value: string) => void;
//   label?: string;
//   required?: boolean;

//   showSearch?: boolean;
//   searchPlaceholder?: string;
//   emptyText?: string;
//   bgClass?: string;
//   maxMenuHeight?: number;

//   error?: boolean;
//   errorMessage?: string;

//   width?: string;
// }

// const Dropdown = ({
//   options,
//   value,
//   placeholder = "Select option",
//   onChange,
//   label,
//   required,
//   showSearch = false,
//   searchPlaceholder = "Search...",
//   emptyText = "No results found",
//   maxMenuHeight = 260,
//   bgClass,
//   error = false,
//   errorMessage = "",

//   width = "w-full",
// }: DropdownProps) => {
//   const selectedOption = options.find((opt) => opt.value === value);

//   const [query, setQuery] = useState("");

//   const filteredOptions = useMemo(() => {
//     if (!showSearch) return options;
//     const q = query.trim().toLowerCase();
//     if (!q) return options;
//     return options.filter((opt) => opt.label.toLowerCase().includes(q));
//   }, [options, query, showSearch]);

//   const handleSelect = (val: string) => {
//     onChange(val);
//     setQuery(""); // ✅ reset search after selection
//   };

//   const resetQuery = () => setQuery("");

//   return (
//     <div className={`${width}`}>
//       {label && (
//         <span className="block mb-1 text-sm text-slate-700 font-normal text-start">
//           {label} {required && <span className="text-red-500"> *</span>}
//         </span>
//       )}

//       <Menu as="div" className="relative w-full flex">
//         <MenuButton
//           className={`w-full h-11 p-2 md:px-3.5 md:py-2.5 ${bgClass || ""}  border focus:rin-0  justify-between flex gap-2 items-center rounded-lg outline-none text-slate-900 placeholder:text-slate-400 placeholder:font-normal
//               ${
//                 error
//                   ? "border-red-500 focus:ring-red-200"
//                   : "border-lightGray focus:ring-gray-200"
//               }
//             `}
//         >
//           <span className={selectedOption ? "text-gray-700" : "text-gray-400"}>
//             {selectedOption?.label || placeholder}
//           </span>
//           <ArrowDownIcon />
//         </MenuButton>

//         <MenuItems
//           transition
//           className="z-50 absolute mt-12 w-full bg-white border border-slate-200 rounded-lg shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm transition duration-100 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0"
//           // ✅ when menu loses focus (closes), clear search
//           onBlur={resetQuery}
//           // ✅ Escape clears query too
//           onKeyDown={(e) => {
//             if (e.key === "Escape") resetQuery();
//           }}
//         >
//           {/* Sticky search */}
//           {showSearch && (
//             <div className="sticky top-0 bg-white p-1 z-10">
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder={searchPlaceholder}
//                 autoComplete="off"
//                 className="w-full h-10 rounded-md border border-slate-200 px-3 placeholder:text-slate-400 text-slate-800 text-sm outline-none focus:ring-0 focus:border-slate-300"
//                 onClick={(e) => e.stopPropagation()}
//                 onKeyDown={(e) => e.stopPropagation()}
//               />
//             </div>
//           )}

//           {/* Scrollable list */}
//           <div
//             className="space-y-1 overflow-auto"
//             style={{ maxHeight: maxMenuHeight }}
//             onWheel={(e) => e.stopPropagation()}
//           >
//             {filteredOptions.length === 0 ? (
//               <div className="px-2.5 py-2 text-xs md:text-sm text-slate-500">
//                 {emptyText}
//               </div>
//             ) : (
//               filteredOptions.map((option) => {
//                 const isSelected = option.value === value;

//                 return (
//                   <MenuItem key={option.value} as={Fragment}>
//                     {({ focus }) => (
//                       <button
//                         onClick={() => handleSelect(option.value)}
//                         className={[
//                           "flex w-full items-center font-medium cursor-pointer justify-between gap-2 rounded-md py-2 px-2.5 text-xs md:text-sm text-slate-800",
//                           focus ? "bg-gray-100" : "",
//                           isSelected ? "bg-slate-100" : "",
//                         ].join(" ")}
//                       >
//                         <span>{option.label}</span>
//                         {/* {isSelected && <CheckIcon />} */}
//                       </button>
//                     )}
//                   </MenuItem>
//                 );
//               })
//             )}
//           </div>
//         </MenuItems>
//       </Menu>
//       {error && errorMessage && (
//         <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
//       )}
//     </div>
//   );
// };

// export default Dropdown;

"use client";

import React, { Fragment, useMemo, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ArrowDownIcon, CheckBoxBase, CheckBoxChecked } from "@/icons";

type DropdownOption = {
  label: string;
  value: string;
  email?: string;
};

type SingleValue = string | undefined;
type MultiValue = string[];

interface DropdownProps {
  options: DropdownOption[];

  // ✅ multi-select support
  multiple?: boolean;

  // In single mode: string | undefined
  // In multi mode: string[]
  value?: SingleValue | MultiValue;

  placeholder?: string;

  // In single mode: (value: string) => void
  // In multi mode: (value: string[]) => void
  onChange: (value: string | string[]) => void;

  label?: string;
  required?: boolean;

  showSearch?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  bgClass?: string;
  maxMenuHeight?: number;

  error?: boolean;
  errorMessage?: string;

  width?: string;
}

const Dropdown = ({
  options,
  value,
  placeholder = "Select option",
  onChange,
  label,
  required,

  multiple = false,

  showSearch = false,
  searchPlaceholder = "Search...",
  emptyText = "No results found",
  maxMenuHeight = 260,
  bgClass,
  error = false,
  errorMessage = "",

  width = "w-full",
}: DropdownProps) => {
  const [query, setQuery] = useState("");

  // ✅ normalize selected values for multi
  const selectedValues: string[] = useMemo(() => {
    if (!multiple) return [];
    return Array.isArray(value) ? value : [];
  }, [multiple, value]);

  const selectedOption = useMemo(() => {
    if (multiple) return undefined;
    return options.find((opt) => opt.value === value);
  }, [multiple, options, value]);

  // const selectedLabels = useMemo(() => {
  //   if (!multiple) return [];
  //   const set = new Set(selectedValues);
  //   return options.filter((o) => set.has(o.value)).map((o) => o.label);
  // }, [multiple, options, selectedValues]);

  const filteredOptions = useMemo(() => {
    if (!showSearch) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query, showSearch]);

  const resetQuery = () => setQuery("");

  const handleSelectSingle = (val: string) => {
    onChange(val);
    setQuery("");
  };

  const toggleMulti = (val: string) => {
    const set = new Set(selectedValues);
    if (set.has(val)) set.delete(val);
    else set.add(val);

    onChange(Array.from(set));
    // keep search text? usually yes; but you asked reset after selection.
    setQuery("");
  };

  // const clearMulti = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   onChange([]);
  // };

  return (
    <div className={`${width}`}>
      {label && (
        <span className="block mb-1 text-sm text-slate-700 font-normal text-start">
          {label} {required && <span className="text-red-500"> *</span>}
        </span>
      )}

      <Menu as="div" className="relative w-full flex">
        <MenuButton
          className={`w-full min-h-11 p-2 md:px-3.5 md:py-2.5 ${
            bgClass || ""
          } border focus:rin-0 justify-between flex gap-2 items-center rounded-lg outline-none text-slate-900 placeholder:text-slate-400 placeholder:font-normal
            ${
              error
                ? "border-red-500 focus:ring-red-200"
                : "border-lightGray focus:ring-gray-200"
            }
          `}
        >
          <div className="flex-1 min-w-0 text-left">
            {/* ✅ MULTI UI */}
            {multiple ? (
              //   selectedLabels.length > 0 ? (
              //     <div className="flex flex-wrap gap-1">
              //       {selectedLabels.slice(0, 3).map((lbl) => (
              //         <span
              //           key={lbl}
              //           className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
              //         >
              //           {lbl}
              //         </span>
              //       ))}
              //       {selectedLabels.length > 3 && (
              //         <span className="text-xs text-slate-500">
              //           +{selectedLabels.length - 3} more
              //         </span>
              //       )}
              //       <button
              //         type="button"
              //         onClick={clearMulti}
              //         className="ml-1 text-xs text-slate-500 hover:text-slate-700 underline"
              //       >
              //         Clear
              //       </button>
              //     </div>
              //   ) : (
              //     <span className="text-gray-400">{placeholder}</span>
              //   )
              // )
              <span
                className={selectedOption ? "text-gray-700" : "text-gray-400"}
              >
                {placeholder}
              </span>
            ) : (
              // ✅ SINGLE UI
              <span
                className={selectedOption ? "text-gray-700" : "text-gray-400"}
              >
                {selectedOption?.label || placeholder}
              </span>
            )}
          </div>

          <ArrowDownIcon />
        </MenuButton>

        <MenuItems
          transition
          className="z-50 absolute mt-12 w-full bg-white border border-slate-200 rounded-lg shadow-[0px_14px_34px_rgba(0,0,0,0.1)] p-1 text-sm transition duration-100 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0"
          onBlur={resetQuery}
          onKeyDown={(e) => {
            if (e.key === "Escape") resetQuery();
          }}
        >
          {showSearch && (
            <div className="sticky top-0 bg-white p-1 z-10">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                autoComplete="off"
                className="w-full h-10 rounded-md border border-slate-200 px-3 placeholder:text-slate-400 text-slate-800 text-sm outline-none focus:ring-0 focus:border-slate-300"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div
            className="space-y-1 overflow-auto"
            style={{ maxHeight: maxMenuHeight }}
            onWheel={(e) => e.stopPropagation()}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-2.5 py-2 text-xs md:text-sm text-slate-500">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple
                  ? selectedValues.includes(option.value)
                  : option.value === value;

                return (
                  <MenuItem key={option.value} as={Fragment}>
                    {({ focus }) => (
                      <button
                        type="button"
                        onClick={() =>
                          multiple
                            ? toggleMulti(option.value)
                            : handleSelectSingle(option.value)
                        }
                        className={[
                          "flex w-full items-center font-medium cursor-pointer gap-2 rounded-md py-2 px-2.5 text-xs md:text-sm text-slate-800",
                          focus ? "bg-gray-100" : "",
                        ].join(" ")}
                      >
                        {isSelected ? <CheckBoxChecked /> : <CheckBoxBase />}
                        <span>{option.label}</span>{" "}
                        {option.email && (
                          <span className="text-gray-600 font-normal">
                            {option.email}
                          </span>
                        )}
                      </button>
                    )}
                  </MenuItem>
                );
              })
            )}
          </div>
        </MenuItems>
      </Menu>

      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default Dropdown;
