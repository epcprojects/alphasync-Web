"use client";
import React, { useState, useEffect, useRef } from "react";
import { Transition } from "@headlessui/react";
import cn from "classnames";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react-dom";
import { ArrowDownIcon, UserIcon } from "@/icons";

type GroupOption =
  | string
  | { name: string; displayName: string; email?: string };

type SelectGroupDropdownProps = {
  selectedGroup: string | string[];
  setSelectedGroup: (group: string | string[]) => void;
  groups: GroupOption[];
  errors?: string;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  name: string;
  placeholder?: string;
  isShowDrop?: boolean;
  required?: boolean;
  multiple?: boolean;
  paddingClasses?: string;
  optionPaddingClasses?: string;
  showLabel?: boolean;
  disabled?: boolean;
  showIcon?: boolean;
};

const getGroupKey = (group: GroupOption) =>
  typeof group === "string" ? group : group.name;

const getGroupLabel = (group: GroupOption) =>
  typeof group === "string" ? group : group.displayName;

const getGroupEmail = (group: GroupOption) =>
  typeof group === "string" ? group : group.email;

const SelectGroupDropdown = ({
  selectedGroup,
  setSelectedGroup,
  groups,
  errors,
  name,
  searchTerm,
  placeholder,
  isShowDrop = true,
  required = true,
  multiple = false,
  paddingClasses = "px-3.5 py-2.5",
  optionPaddingClasses = "p-2",
  showLabel = true,
  disabled = false,
  showIcon,
}: SelectGroupDropdownProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { x, y, strategy, update, refs } = useFloating({
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift()],
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownOpen && refs.reference.current && refs.floating.current) {
      return autoUpdate(refs.reference.current, refs.floating.current, update);
    }
  }, [isDropdownOpen, refs.reference, refs.floating, update]);

  const safeGroups = groups ?? [];

  const filteredGroups = safeGroups.filter((group) =>
    getGroupLabel(group).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const filteredGroups = groups.filter((group) =>
  //   getGroupLabel(group).toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const handleSelect = (group: GroupOption) => {
    const key = getGroupKey(group);

    if (multiple) {
      const current = selectedGroup as string[];
      if (current.includes(key)) {
        setSelectedGroup(current.filter((g) => g !== key));
      } else {
        setSelectedGroup([...current, key]);
      }
    } else {
      setSelectedGroup(key);
      setIsDropdownOpen(false);
    }
  };

  const isSelected = (key: string) => {
    return multiple
      ? (selectedGroup as string[]).includes(key)
      : selectedGroup === key;
  };

  const selectedDisplay = () => {
    if (multiple) {
      const selected = selectedGroup as string[];
      if (selected.length === 0) return placeholder || "Select User...";
      return selected
        .map((key) =>
          getGroupLabel(safeGroups.find((g) => getGroupKey(g) === key) ?? key)
        )
        .join(", ");
    } else {
      const selected = safeGroups.find(
        (g) =>
          getGroupKey(g).toLowerCase() ===
          (selectedGroup as string)?.toLowerCase()
      );
      return selected
        ? getGroupEmail(selected)
          ? `${getGroupLabel(selected)} - ${getGroupEmail(selected)}`
          : getGroupLabel(selected)
        : placeholder || "Select group...";
    }
  };

  return (
    <>
      {showLabel && (
        <label className="block mb-1 md:mb-1.5 text-sm  font-medium text-gray-700">
          {name}
          {required && <span className="text-red-500 ps-1">*</span>}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <div
          ref={refs.setReference}
          className={cn(
            "relative z-10 w-full h-11 rounded-lg py-2 border cursor-pointer bg-white text-left",
            errors ? "border-red-500" : "border-lightGray",
            disabled && "!bg-gray-200 text-gray-400 cursor-not-allowed",
            paddingClasses
          )}
          onClick={() => {
            if (!disabled) {
              setIsDropdownOpen((prev) => !prev);
            }
          }}
        >
          <span
            className={cn(
              "text-sm md:text-base flex items-center gap-1",
              selectedGroup ? "text-gray-900" : "text-gray-400"
            )}
          >
            {showIcon && (
              <span className="shrink-0">
                <UserIcon />
              </span>
            )}
            <span className="line-clamp-1 text-gray-900 text-sm md:text- pe-3 leading-7">
              {selectedDisplay()}
            </span>
          </span>
          <div className="absolute -translate-y-1/2 right-2 top-1/2">
            <span className=" block">
              <ArrowDownIcon />
            </span>
          </div>
        </div>

        <Transition
          show={isDropdownOpen && isShowDrop}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 9999,
              width: "100%",
            }}
            className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
          >
            <div
              className={cn(
                " space-y-1 max-h-32 md:max-h-36 overflow-y-auto",
                optionPaddingClasses
              )}
            >
              {filteredGroups.map((group) => {
                const key = getGroupKey(group);
                const label = getGroupLabel(group);
                const email = getGroupEmail(group);
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center justify-between cursor-pointer rounded-md px-2.5 py-2 hover:bg-gray-100",
                      isSelected(key) && "bg-primary/10",
                      optionPaddingClasses
                    )}
                    onClick={() => handleSelect(group)}
                  >
                    <span className="text-xs sm:text-sm flex font-medium items-center gap-2 text-gray-900">
                      {label}
                      {email && (
                        <span className="text-gray-600 font-normal">
                          {email}
                        </span>
                      )}
                    </span>
                    {isSelected(key) && (
                      <span className="text-green-500 text-sm font-bold">
                        &#10003;
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Transition>
      </div>
    </>
  );
};

export default SelectGroupDropdown;
