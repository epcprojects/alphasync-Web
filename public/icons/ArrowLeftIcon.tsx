import React from "react";

const ArrowLeftIcon = ({ stroke = "#9CA3AF", width = "20", height = "21" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.8333 10.097H4.16663M4.16663 10.097L9.99996 15.9303M4.16663 10.097L9.99996 4.26367"
        stroke={stroke}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowLeftIcon;
