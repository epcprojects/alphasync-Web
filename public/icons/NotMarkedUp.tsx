import React from "react";

const NotMarkedUpIcon = ({ width = "24", height = "24", color = "currentColor" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 10.4375V17.875C23 18.4386 22.756 18.9791 22.3217 19.3776C21.8874 19.7761 21.2984 20 20.6842 20H7.94737L1 10.4375L10.2632 3H15.4737H20.6842C21.2984 3 21.8874 3.22388 22.3217 3.6224C22.756 4.02091 23 4.56141 23 5.125V10.4375Z" />
      <path d="M19 8C19.5523 8 20 7.55228 20 7C20 6.44772 19.5523 6 19 6C18.4477 6 18 6.44772 18 7C18 7.55228 18.4477 8 19 8Z" />
    </svg>
  );
};

export default NotMarkedUpIcon;
