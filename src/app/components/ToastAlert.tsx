"use client";

import { toast } from "react-toastify";
import { InfoIcon } from "@/icons";

export const toastAlert = (message: string, isSuccess: boolean, duration: number = 3000) => {
  const toastConfig = {
    position: "top-right" as const,
    icon: <InfoIcon />,
    closeButton: false,
    autoClose: duration,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      position: "fixed" as const,
      top: "1%",
      right: "20px",
      width: "260px",
      maxHeight: "44px",
      minHeight: "44px",
      padding: "8px",
      color: "#111827",
    },
  };

  if (isSuccess) {
    toast.success(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        backgroundColor: "#F0FDF4",
      },
    });
  } else {
    toast.error(message, {
      ...toastConfig,
      style: {
        ...toastConfig.style,
        backgroundColor: "#FEF3F2",
      },
    });
  }
};
