import React from "react";

const CalendarIcon = ({ width = 20, height = 20 }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.6665 9.99967C1.6665 6.85698 1.6665 5.28563 2.64281 4.30932C3.61913 3.33301 5.19047 3.33301 8.33317 3.33301H11.6665C14.8092 3.33301 16.3805 3.33301 17.3569 4.30932C18.3332 5.28563 18.3332 6.85698 18.3332 9.99967V11.6663C18.3332 14.809 18.3332 16.3804 17.3569 17.3567C16.3805 18.333 14.8092 18.333 11.6665 18.333H8.33317C5.19047 18.333 3.61913 18.333 2.64281 17.3567C1.6665 16.3804 1.6665 14.809 1.6665 11.6663V9.99967Z"
        stroke="#374151"
      />
      <path
        d="M5.8335 3.33301V2.08301"
        stroke="#374151"
        strokeLinecap="round"
      />
      <path
        d="M14.1665 3.33301V2.08301"
        stroke="#374151"
        strokeLinecap="round"
      />
      <path d="M2.0835 7.5H17.9168" stroke="#374151" strokeLinecap="round" />
    </svg>
  );
};

export default CalendarIcon;
