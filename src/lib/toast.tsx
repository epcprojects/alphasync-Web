import { toast } from "react-toastify";
import { ToastSuccessIcon } from "@/icons";

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: "top-right",
    icon: <ToastSuccessIcon />,
    closeButton: false,
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      width: "fit-content",
      maxHeight: "44px",
      minHeight: "44px",
      backgroundColor: "#079455",
      color: "white",
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    position: "top-right",
    closeButton: false,
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
