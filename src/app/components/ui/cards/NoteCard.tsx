"use client";
import React from "react";
import { TrashBinIcon } from "@/icons";
import Tooltip from "../tooltip";

interface NoteCardProps {
  doctor: string;
  date: string;
  text: string;
  onDelete?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  doctor,
  date,
  text,
  onDelete,
}) => {
  return (
    <div className="py-3 md:py-5 flex items-center justify-between gap-2.5 md:gap-5 last:border-b-0 border-b border-b-gray-200">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 md:gap-3">
          <h2 className="text-sm md:text-base text-gray-800 font-semibold">
            {doctor}
          </h2>
          <span className="w-1.5 h-1.5 block rounded-full shrink-0 bg-gray-200"></span>
          <h3 className="text-xs md:text-sm font-medium text-gray-500">
            {date}
          </h3>
        </div>
        <p className="text-sm md:text-lg text-gray-800 font-normal">{text}</p>
      </div>

      <Tooltip content="Delete Note">
        <button
          onClick={onDelete}
          className="rounded-lg hover:bg-red-100 flex items-center justify-center w-6 h-6 md:w-8 md:h-8 cursor-pointer"
        >
          <TrashBinIcon />
        </button>
      </Tooltip>
    </div>
  );
};

export default NoteCard;
