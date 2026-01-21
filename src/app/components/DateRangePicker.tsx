// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { DateRange, RangeKeyDict } from "react-date-range";
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";
// import ThemeButton from "./ui/buttons/ThemeButton";

// const DateRangeSelector: React.FC = () => {
//   const [open, setOpen] = useState(false);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const [range, setRange] = useState<any>([
//     {
//       startDate: new Date(),
//       endDate: new Date(),
//       key: "selection",
//     },
//   ]);

//   const [tempRange, setTempRange] = useState(range);

//   const handleSelect = (item: RangeKeyDict) => {
//     setTempRange([item.selection]);
//   };

//   const handleApply = () => {
//     setRange(tempRange);
//     setOpen(false);
//   };

//   const handleCancel = () => {
//     setTempRange(range);
//     setOpen(false);
//   };

//   const quickRanges: Record<string, { startDate: Date; endDate: Date }> = {
//     Today: { startDate: new Date(), endDate: new Date() },
//     Yesterday: {
//       startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
//       endDate: new Date(new Date().setDate(new Date().getDate() - 1)),
//     },
//     "This week": {
//       startDate: new Date(
//         new Date().setDate(new Date().getDate() - new Date().getDay())
//       ),
//       endDate: new Date(),
//     },
//     "Last week": {
//       startDate: new Date(
//         new Date().setDate(new Date().getDate() - new Date().getDay() - 7)
//       ),
//       endDate: new Date(
//         new Date().setDate(new Date().getDate() - new Date().getDay() - 1)
//       ),
//     },
//     "This month": {
//       startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//       endDate: new Date(),
//     },
//     "Last month": {
//       startDate: new Date(
//         new Date().getFullYear(),
//         new Date().getMonth() - 1,
//         1
//       ),
//       endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
//     },
//     "This year": {
//       startDate: new Date(new Date().getFullYear(), 0, 1),
//       endDate: new Date(),
//     },
//     "Last year": {
//       startDate: new Date(new Date().getFullYear() - 1, 0, 1),
//       endDate: new Date(new Date().getFullYear() - 1, 11, 31),
//     },
//     "All time": {
//       startDate: new Date(2000, 0, 1),
//       endDate: new Date(),
//     },
//   };

//   const handleQuickSelect = (label: string) => {
//     setTempRange([
//       {
//         startDate: quickRanges[label].startDate,
//         endDate: quickRanges[label].endDate,
//         key: "selection",
//       },
//     ]);
//   };
//   const wrapperRef = useRef<HTMLDivElement | null>(null);
//   const buttonRef = useRef<HTMLButtonElement | null>(null);
//   // Close on outside click or Esc
//   useEffect(() => {
//     if (!open) return;

//     const onClickOutside = (e: MouseEvent | TouchEvent) => {
//       const target = e.target as Node;
//       const clickedInside =
//         wrapperRef.current?.contains(target) ||
//         buttonRef.current?.contains(target);
//       if (!clickedInside) setOpen(false);
//     };

//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setOpen(false);
//     };

//     document.addEventListener("mousedown", onClickOutside);
//     document.addEventListener("touchstart", onClickOutside, { passive: true });
//     document.addEventListener("keydown", onKey);

//     return () => {
//       document.removeEventListener("mousedown", onClickOutside);
//       document.removeEventListener("touchstart", onClickOutside);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, [open]);

//   return (
//     <div className="relative inline-block">
//       <button
//         ref={buttonRef}
//         className="px-4 py-2 bg-blue-600 text-white rounded-md"
//         onClick={() => setOpen(!open)}
//       >
//         Select Date Range
//       </button>
//       {open && (
//         <div
//           ref={wrapperRef}
//           className="absolute mt-2 end-0 bg-white shadow-[0px_20px_24px_-4px_rgba(10,13,18,0.08),_0px_8px_8px_-4px_rgba(10,13,18,0.03),_0px_3px_3px_-1.5px_rgba(10,13,18,0.04)] z-50 flex  rounded-xl"
//         >
//           <div className="p-2 border-r border-r-mercury w-40 rounded-l-2xl bg-white">
//             {Object.keys(quickRanges).map((label) => (
//               <div
//                 key={label}
//                 onClick={() => handleQuickSelect(label)}
//                 className={`px-3 py-2 cursor-pointer rounded-md text-sm ${
//                   tempRange[0].startDate.toDateString() ===
//                     quickRanges[label].startDate.toDateString() &&
//                   tempRange[0].endDate.toDateString() ===
//                     quickRanges[label].endDate.toDateString()
//                     ? "bg-primary text-white hover:bg-primary font-medium"
//                     : "hover:bg-gray-100 "
//                 }`}
//               >
//                 {label}
//               </div>
//             ))}
//           </div>

//           <div className="flex flex-col">
//             <DateRange
//               ranges={tempRange}
//               onChange={handleSelect}
//               moveRangeOnFirstSelection={false}
//               months={2}
//               direction="horizontal"
//               showDateDisplay={false}
//             />

//             <div className="flex items-center justify-between border-t border-t-mercury px-4 py-2 gap-3">
//               <div className="flex justify-between items-center gap-2 text-sm text-gray-700">
//                 <div className="text-haiti border border-lightGray  py-2 px-3 rounded-lg">
//                   {tempRange[0].startDate?.toDateString()}
//                 </div>
//                 <span className="text-gray-700 block">–</span>
//                 <div className="text-haiti border border-lightGray py-2 px-3 rounded-lg">
//                   {tempRange[0].endDate?.toDateString()}
//                 </div>
//               </div>
//               <div className="flex justify-end gap-2">
//                 <ThemeButton
//                   label="Cancel"
//                   heightClass="h-10"
//                   onClick={handleCancel}
//                   variant="outline"
//                 />

//                 <ThemeButton
//                   label="Apply"
//                   heightClass="h-10"
//                   onClick={handleApply}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DateRangeSelector;

// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { DateRange, RangeKeyDict } from "react-date-range";
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";
// import ThemeButton from "./ui/buttons/ThemeButton";
// import { CalendarIcon } from "@/icons";
// import { useIsMobile } from "@/hooks/useIsMobile";

// type Selection = {
//   startDate: Date;
//   endDate: Date;
//   key: "selection";
// };

// interface DateRangeSelectorProps {
//   /** The current value from parent (controlled) */
//   value: Selection;
//   /** Fires on every calendar/quick change (before Apply) */
//   onChange?: (next: Selection) => void;
//   /** Fires when user clicks Apply (commit) */
//   onApply: (next: Selection) => void;
//   /** Optional: fires when user clicks Cancel */
//   onCancel?: () => void;
//   /** Optional: control initial open/closed */
//   defaultOpen?: boolean;

//   label?: string;
// }

// const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
//   value,
//   onChange,
//   onApply,
//   onCancel,
//   defaultOpen = false,
//   label,
// }) => {
//   const [open, setOpen] = useState(defaultOpen);

//   // tempRange is local (staging) until Apply
//   const [tempRange, setTempRange] = useState<Selection[]>([value]);

//   // Keep local temp in sync if parent value changes from outside
//   useEffect(() => {
//     setTempRange([value]);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [value.startDate, value.endDate]);

//   const handleSelect = (item: RangeKeyDict) => {
//     const next = item.selection as Selection;
//     setTempRange([next]);
//     onChange?.(next);
//   };

//   const handleApply = () => {
//     onApply(tempRange[0]);
//     setOpen(false);
//   };

//   const handleCancel = () => {
//     // revert temp to parent value
//     setTempRange([value]);
//     onCancel?.();
//     setOpen(false);
//   };

//   // Quick ranges
//   // const quickRanges: Record<string, { startDate: Date; endDate: Date }> = {
//   //   Today: { startDate: new Date(), endDate: new Date() },
//   //   Yesterday: {
//   //     startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
//   //     endDate: new Date(new Date().setDate(new Date().getDate() - 1)),
//   //   },
//   //   "This week": {
//   //     startDate: new Date(
//   //       new Date().setDate(new Date().getDate() - new Date().getDay())
//   //     ),
//   //     endDate: new Date(),
//   //   },
//   //   "Last week": {
//   //     startDate: new Date(
//   //       new Date().setDate(new Date().getDate() - new Date().getDay() - 7)
//   //     ),
//   //     endDate: new Date(
//   //       new Date().setDate(new Date().getDate() - new Date().getDay() - 1)
//   //     ),
//   //   },
//   //   "This month": {
//   //     startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//   //     endDate: new Date(),
//   //   },
//   //   "Last month": {
//   //     startDate: new Date(
//   //       new Date().getFullYear(),
//   //       new Date().getMonth() - 1,
//   //       1
//   //     ),
//   //     endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
//   //   },
//   //   "This year": {
//   //     startDate: new Date(new Date().getFullYear(), 0, 1),
//   //     endDate: new Date(),
//   //   },
//   //   "Last year": {
//   //     startDate: new Date(new Date().getFullYear() - 1, 0, 1),
//   //     endDate: new Date(new Date().getFullYear() - 1, 11, 31),
//   //   },
//   //   "All time": {
//   //     startDate: new Date(2000, 0, 1),
//   //     endDate: new Date(),
//   //   },
//   // };

//   // const handleQuickSelect = (label: string) => {
//   //   const r = quickRanges[label];
//   //   const next: Selection = {
//   //     startDate: r.startDate,
//   //     endDate: r.endDate,
//   //     key: "selection",
//   //   };
//   //   setTempRange([next]);
//   //   onChange?.(next);
//   // };

//   // outside click + Esc to close
//   const wrapperRef = useRef<HTMLDivElement | null>(null);
//   const buttonRef = useRef<HTMLButtonElement | null>(null);
//   useEffect(() => {
//     if (!open) return;
//     const onClickOutside = (e: MouseEvent | TouchEvent) => {
//       const target = e.target as Node;
//       const inside =
//         wrapperRef.current?.contains(target) ||
//         buttonRef.current?.contains(target);
//       if (!inside) setOpen(false);
//     };
//     const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);

//     document.addEventListener("mousedown", onClickOutside);
//     document.addEventListener("touchstart", onClickOutside, { passive: true });
//     document.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("mousedown", onClickOutside);
//       document.removeEventListener("touchstart", onClickOutside);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, [open]);

//   // const isQuickSelected = (label: string) =>
//   //   tempRange[0].startDate.toDateString() ===
//   //     quickRanges[label].startDate.toDateString() &&
//   //   tempRange[0].endDate.toDateString() ===
//   //     quickRanges[label].endDate.toDateString();

//   const isMobile = useIsMobile();

//   return (
//     <div className="relative inline-block">
//       <button
//         ref={buttonRef}
//         className="h-9 px-4 gap-1 font-medium md:h-10  flex items-center justify-center cursor-pointer bg-gray-100  text-gray-700 rounded-full"
//         onClick={() => setOpen((v) => !v)}
//       >
//         {label && label}
//         <CalendarIcon height={isMobile ? 16 : 20} width={isMobile ? 16 : 20} />
//       </button>

//       {open && (
//         <div
//           ref={wrapperRef}
//           className="absolute mt-2 -end-2 overflow-hidden bg-white shadow-[0px_20px_24px_-4px_rgba(10,13,18,0.08),_0px_8px_8px_-4px_rgba(10,13,18,0.03),_0px_3px_3px_-1.5px_rgba(10,13,18,0.04)] z-50 flex rounded-xl"
//         >
//           {/* Quick select */}
//           {/* <div className="p-2 border-r border-r-gray-200 w-40 rounded-l-2xl bg-white">
//             {Object.keys(quickRanges).map((label) => (
//               <div
//                 key={label}
//                 onClick={() => handleQuickSelect(label)}
//                 className={`px-3 py-2 cursor-pointer rounded-md text-sm ${
//                   isQuickSelected(label)
//                     ? "bg-primary text-white hover:bg-primary font-medium"
//                     : "hover:bg-gray-100 text-gravel"
//                 }`}
//               >
//                 {label}
//               </div>
//             ))}
//           </div> */}

//           {/* Calendar + footer */}
//           <div className="flex flex-col rounded-t-2xl">
//             <DateRange
//               ranges={tempRange}
//               onChange={handleSelect}
//               moveRangeOnFirstSelection={false}
//               months={2}
//               direction="horizontal"
//               showDateDisplay={false}
//               weekdayDisplayFormat="EE" /* show 2-letter weekdays if you want */
//             />

//             <div className="flex items-center justify-between border-t border-t-gray-200 px-4 py-2 gap-3">
//               <div className="flex justify-between items-center gap-2 text-sm text-gray-700">
//                 <div className="text-gray-900 border border-gray-300 py-2 px-3 rounded-lg">
//                   {tempRange[0].startDate?.toDateString()}
//                 </div>
//                 <span className="text-gray-700 block">–</span>
//                 <div className="text-gray-900 border border-gray-300 py-2 px-3 rounded-lg">
//                   {tempRange[0].endDate?.toDateString()}
//                 </div>
//               </div>
//               <div className="flex justify-end gap-2">
//                 <ThemeButton
//                   label="Cancel"
//                   heightClass="h-10"
//                   onClick={handleCancel}
//                   variant="outline"
//                 />
//                 <ThemeButton
//                   label="Apply"
//                   heightClass="h-10"
//                   onClick={handleApply}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DateRangeSelector;

"use client";

import React, { useEffect, useRef, useState } from "react";
import { DateRange, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { CalendarDotsIcon, CalendarIcon } from "@/icons";
import { useIsMobile } from "@/hooks/useIsMobile";

type Selection = {
  startDate: Date;
  endDate: Date;
  key: "selection";
};

interface DateRangeSelectorProps {
  value: Selection;
  onChange: (next: Selection) => void;
  defaultOpen?: boolean;

  showLabel?: boolean;
  label?: string;
  active?: boolean;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  defaultOpen = false,
  showLabel,
  label,
  active,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isMobile = useIsMobile();

  const handleSelect = (item: RangeKeyDict) => {
    const next = item.selection as Selection;
    onChange(next); // ✅ APPLY IMMEDIATELY
  };
  useEffect(() => {
    if (!open) return;

    const onClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        !wrapperRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside, { passive: true });
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className={
          showLabel
            ? `${
                isMobile ? "h-9 text-xs" : "h-10 text-sm"
              } px-3 rounded-full flex items-center sm:min-w-auto min-w-44 justify-center gap-2 border transition ${
                active
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-100 text-slate-700 border-transparent hover:bg-gray-200"
              }`
            : "h-9 w-9 md:h-10 md:w-10 flex items-center justify-center bg-gray-100 text-slate-700 rounded-full"
        }
      >
        {showLabel && (
          <span className="text-xs lg:text-sm whitespace-nowrap font-semibold">
            {label}
          </span>
        )}
        <CalendarDotsIcon
          fill="currentColor"
          height={isMobile ? 16 : 20}
          width={isMobile ? 16 : 20}
        />
      </button>

      {open && (
        <div
          ref={wrapperRef}
          className="absolute mt-2 end-0 overflow-hidden bg-white shadow-xl z-50 flex rounded-xl"
        >
          {/* Calendar */}
          <DateRange
            ranges={[value]}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            months={isMobile ? 1 : 2}
            direction="horizontal"
            showDateDisplay={false}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
